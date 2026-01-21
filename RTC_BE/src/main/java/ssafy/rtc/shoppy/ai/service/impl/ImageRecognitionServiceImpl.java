package ssafy.rtc.shoppy.ai.service.impl;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.api.gax.rpc.ApiException;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.vision.v1.AnnotateImageRequest;
import com.google.cloud.vision.v1.AnnotateImageResponse;
import com.google.cloud.vision.v1.Feature;
import com.google.cloud.vision.v1.Image;
import com.google.cloud.vision.v1.ImageAnnotatorClient;
import com.google.cloud.vision.v1.ImageAnnotatorSettings;
import com.google.cloud.vision.v1.ImageSource;
import com.google.cloud.vision.v1.Likelihood;
import com.google.cloud.vision.v1.SafeSearchAnnotation;
import com.google.protobuf.ByteString;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import ssafy.rtc.shoppy.ai.dto.ImageRecognitionLabelDto;
import ssafy.rtc.shoppy.ai.dto.ImageRecognitionRequestDto;
import ssafy.rtc.shoppy.ai.dto.ImageRecognitionResponseDto;
import ssafy.rtc.shoppy.ai.dto.ImageRecognitionSafeSearchDto;
import ssafy.rtc.shoppy.ai.service.ImageRecognitionService;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ImageRecognitionServiceImpl implements ImageRecognitionService {

    private static final int MAX_IMAGE_BYTES = 5 * 1024 * 1024;

    private final String credentialsPath;

    public ImageRecognitionServiceImpl(@Value("${google.cloud.vision.credentials-path:}") String credentialsPath) {
        this.credentialsPath = credentialsPath;
    }

    @Override
    public List<ImageRecognitionResponseDto> analyzeImages(List<ImageRecognitionRequestDto> payload) {
        if (payload == null || payload.isEmpty()) {
            throw new BusinessException(ErrorCode.MISSING_FIELD, "이미지 분석 요청 리스트는 비어 있을 수 없습니다.");
        }

        try (ImageAnnotatorClient client = createClient()) {
            return payload.stream()
                    .map(request -> annotateSingle(client, request))
                    .collect(Collectors.toList());
        } catch (IOException | ApiException e) {
            log.error("Google Vision 연동 실패", e);
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "Google Vision 호출 중 문제가 발생했습니다.", e.getMessage());
        }
    }

    private ImageRecognitionResponseDto annotateSingle(ImageAnnotatorClient client, ImageRecognitionRequestDto request) {
        Image image = buildImage(request);
        Feature labelFeature = Feature.newBuilder()
                .setType(Feature.Type.LABEL_DETECTION)
                .setMaxResults(10)
                .build();

        Feature safeSearchFeature = Feature.newBuilder()
                .setType(Feature.Type.SAFE_SEARCH_DETECTION)
                .build();

        AnnotateImageRequest annotateRequest = AnnotateImageRequest.newBuilder()
                .addFeatures(labelFeature)
                .addFeatures(safeSearchFeature)
                .setImage(image)
                .build();

        long startMs = System.currentTimeMillis();
        AnnotateImageResponse response = client.batchAnnotateImages(List.of(annotateRequest)).getResponses(0);
        log.debug("이미지 분석 처리 시간(ms): {}", System.currentTimeMillis() - startMs);

        if (response.hasError()) {
            log.warn("Vision API 오류: {}", response.getError().getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "Vision API 오류: " + response.getError().getMessage());
        }

        List<ImageRecognitionLabelDto> labelDetails = response.getLabelAnnotationsList().stream()
                .map(annotation -> ImageRecognitionLabelDto.builder()
                        .label(annotation.getDescription())
                        .confidence(annotation.getScore())
                        .build())
                .collect(Collectors.toList());

        SafeSearchAnnotation safeSearchAnnotation = response.getSafeSearchAnnotation();

        List<String> detectedTags = labelDetails.stream()
                .map(ImageRecognitionLabelDto::getLabel)
                .collect(Collectors.toList());

        return ImageRecognitionResponseDto.builder()
                .imageUrl(StringUtils.hasText(request.getImageUrl()) ? request.getImageUrl() : "[base64-content]")
                .detectedTags(detectedTags)
                .labelDetails(labelDetails)
                .safeContent(isContentSafe(safeSearchAnnotation))
                .safeSearch(ImageRecognitionSafeSearchDto.from(safeSearchAnnotation))
                .build();
    }

    private Image buildImage(ImageRecognitionRequestDto request) {
        if (StringUtils.hasText(request.getImageBase64())) {
            byte[] decoded;
            try {
                decoded = Base64.getDecoder().decode(request.getImageBase64());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_FORMAT, "Base64 이미지 콘텐츠가 유효하지 않습니다.");
            }

            if (decoded.length > MAX_IMAGE_BYTES) {
                throw new BusinessException(ErrorCode.OUT_OF_RANGE, "이미지 용량이 허용된 상한(5MB)을 초과했습니다.");
            }

            log.debug("Base64 이미지 크기(bytes): {}", decoded.length);
            return Image.newBuilder()
                    .setContent(ByteString.copyFrom(decoded))
                    .build();
        }

        if (StringUtils.hasText(request.getImageUrl())) {
            return Image.newBuilder()
                    .setSource(ImageSource.newBuilder().setImageUri(request.getImageUrl()))
                    .build();
        }

        throw new BusinessException(ErrorCode.MISSING_FIELD, "imageUrl 또는 imageBase64 중 하나를 제공해야 합니다.");
    }

    private ImageAnnotatorClient createClient() throws IOException {
        if (!StringUtils.hasText(credentialsPath)) {
            return ImageAnnotatorClient.create();
        }

        GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(credentialsPath))
                .createScoped(ImageAnnotatorSettings.getDefaultServiceScopes());

        ImageAnnotatorSettings settings = ImageAnnotatorSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                .build();

        return ImageAnnotatorClient.create(settings);
    }

    private boolean isContentSafe(SafeSearchAnnotation annotation) {
        if (annotation == null) {
            return true;
        }
        return annotation.getAdultValue() <= Likelihood.POSSIBLE_VALUE
                && annotation.getViolenceValue() <= Likelihood.POSSIBLE_VALUE
                && annotation.getRacyValue() <= Likelihood.POSSIBLE_VALUE;
    }
}
