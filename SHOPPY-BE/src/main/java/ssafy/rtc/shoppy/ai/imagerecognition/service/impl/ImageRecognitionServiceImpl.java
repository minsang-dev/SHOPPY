package ssafy.rtc.shoppy.ai.imagerecognition.service.impl;

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
import com.google.cloud.vision.v1.WebDetection;
import com.google.protobuf.ByteString;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import ssafy.rtc.shoppy.ai.imagerecognition.dto.ImageRecognitionLabelDto;
import ssafy.rtc.shoppy.ai.imagerecognition.dto.ImageRecognitionLogoDto;
import ssafy.rtc.shoppy.ai.imagerecognition.dto.ImageRecognitionRequestDto;
import ssafy.rtc.shoppy.ai.imagerecognition.dto.ImageRecognitionResponseDto;
import ssafy.rtc.shoppy.ai.imagerecognition.dto.ImageRecognitionSafeSearchDto;
import ssafy.rtc.shoppy.ai.imagerecognition.dto.ImageRecognitionTextDto;
import ssafy.rtc.shoppy.ai.imagerecognition.dto.ImageRecognitionWebEntityDto;
import ssafy.rtc.shoppy.ai.imagerecognition.dto.ImageRecognitionWebLabelDto;
import ssafy.rtc.shoppy.ai.imagerecognition.dto.ProductMatchDto;
import ssafy.rtc.shoppy.ai.imagerecognition.service.ImageRecognitionService;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;
import ssafy.rtc.shoppy.product.service.ProductMatchService;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ImageRecognitionServiceImpl implements ImageRecognitionService {

    private static final int MAX_IMAGE_BYTES = 5 * 1024 * 1024;
    private static final Feature DEFAULT_LABEL_FEATURE = Feature.newBuilder()
            .setType(Feature.Type.LABEL_DETECTION)
            .setMaxResults(10)
            .build();
    private static final Feature DEFAULT_SAFE_SEARCH_FEATURE = Feature.newBuilder()
            .setType(Feature.Type.SAFE_SEARCH_DETECTION)
            .build();

    private final String credentialsPath;
    private final ProductMatchService productMatchService;

    public ImageRecognitionServiceImpl(ProductMatchService productMatchService,
                                       @Value("${google.cloud.vision.credentials-path:}") String credentialsPath) {
        this.productMatchService = productMatchService;
        this.credentialsPath = credentialsPath;
    }

    @Override
    public List<ImageRecognitionResponseDto> analyzeImages(List<ImageRecognitionRequestDto> payload) {
        if (payload == null || payload.isEmpty()) {
            throw new BusinessException(ErrorCode.MISSING_FIELD, "이미지 요청이 없습니다.");
        }

        try (ImageAnnotatorClient client = createClient()) {
            return payload.stream()
                    .map(request -> annotateSingle(client, request))
                    .collect(Collectors.toList());
        } catch (IOException | ApiException e) {
            log.error("Google Vision 호출 실패", e);
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "Google Vision 처리 중 문제가 발생했습니다.", e.getMessage());
        }
    }

    private ImageRecognitionResponseDto annotateSingle(ImageAnnotatorClient client, ImageRecognitionRequestDto request) {
        Image image = buildImage(request);
        List<Feature> features = buildFeatures(request);

        AnnotateImageRequest annotateRequest = AnnotateImageRequest.newBuilder()
                .addAllFeatures(features)
                .setImage(image)
                .build();

        long startMs = System.currentTimeMillis();
        AnnotateImageResponse response = client.batchAnnotateImages(List.of(annotateRequest)).getResponses(0);
        log.debug("Vision 응답 소요(ms): {}", System.currentTimeMillis() - startMs);

        if (response.hasError()) {
            log.warn("Vision API 에러: {}", response.getError().getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "Vision API 에러: " + response.getError().getMessage());
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

        List<ImageRecognitionLogoDto> logos = response.getLogoAnnotationsList().stream()
                .map(annotation -> ImageRecognitionLogoDto.builder()
                        .description(annotation.getDescription())
                        .confidence(annotation.getScore())
                        .build())
                .collect(Collectors.toList());

        List<ImageRecognitionTextDto> texts = response.getTextAnnotationsList().stream()
                .map(annotation -> ImageRecognitionTextDto.builder()
                        .description(annotation.getDescription())
                        .locale(annotation.getLocale())
                        .build())
                .collect(Collectors.toList());

        WebDetection webDetection = response.getWebDetection();
        List<ImageRecognitionWebLabelDto> bestGuessLabels = webDetection == null ? List.of() :
                webDetection.getBestGuessLabelsList().stream()
                        .map(label -> ImageRecognitionWebLabelDto.builder()
                                .label(label.getLabel())
                                .languageCode(label.getLanguageCode())
                                .build())
                        .collect(Collectors.toList());

        List<ImageRecognitionWebEntityDto> webEntities = webDetection == null ? List.of() :
                webDetection.getWebEntitiesList().stream()
                        .map(entity -> ImageRecognitionWebEntityDto.builder()
                                .entityId(entity.getEntityId())
                                .description(entity.getDescription())
                                .score(entity.getScore())
                                .build())
                        .collect(Collectors.toList());

        List<ProductMatchService.Candidate> candidates = collectCandidates(logos, texts, bestGuessLabels, webEntities);
        Optional<ProductMatchDto> finalMatch = productMatchService.match(candidates);

        return ImageRecognitionResponseDto.builder()
                .imageUrl(StringUtils.hasText(request.getImageUrl()) ? request.getImageUrl() : "[base64-content]")
                .detectedTags(detectedTags)
                .labelDetails(labelDetails)
                .safeContent(isContentSafe(safeSearchAnnotation))
                .safeSearch(ImageRecognitionSafeSearchDto.from(safeSearchAnnotation))
                .logos(logos)
                .texts(texts)
                .bestGuessLabels(bestGuessLabels)
                .webEntities(webEntities)
                .finalMatch(finalMatch.orElse(null))
                .build();
    }

    private List<Feature> buildFeatures(ImageRecognitionRequestDto request) {
        List<String> requested = request == null ? null : request.getFeatures();
        if (requested == null || requested.isEmpty()) {
            return List.of(DEFAULT_LABEL_FEATURE, DEFAULT_SAFE_SEARCH_FEATURE);
        }
        return requested.stream()
                .map(this::buildFeature)
                .collect(Collectors.toList());
    }

    private List<ProductMatchService.Candidate> collectCandidates(
            List<ImageRecognitionLogoDto> logos,
            List<ImageRecognitionTextDto> texts,
            List<ImageRecognitionWebLabelDto> webLabels,
            List<ImageRecognitionWebEntityDto> webEntities
    ) {
        List<ProductMatchService.Candidate> candidates = new ArrayList<>();
        logos.forEach(logo -> addCandidate(candidates, logo.getDescription(), ProductMatchService.CandidateSource.LOGO));
        texts.forEach(text -> addCandidate(candidates, text.getDescription(), ProductMatchService.CandidateSource.TEXT));
        webLabels.forEach(label -> addCandidate(candidates, label.getLabel(), ProductMatchService.CandidateSource.WEB_LABEL));
        webEntities.forEach(entity -> addCandidate(candidates, entity.getDescription(), ProductMatchService.CandidateSource.WEB_ENTITY));
        return candidates;
    }

    private void addCandidate(List<ProductMatchService.Candidate> candidates, String value, ProductMatchService.CandidateSource source) {
        if (!StringUtils.hasText(value)) {
            return;
        }
        candidates.add(new ProductMatchService.Candidate(value.trim(), source));
    }

    private Feature buildFeature(String featureName) {
        try {
            Feature.Type type = Feature.Type.valueOf(featureName);
            Feature.Builder builder = Feature.newBuilder().setType(type);
            if (type == Feature.Type.LABEL_DETECTION
                    || type == Feature.Type.LOGO_DETECTION
                    || type == Feature.Type.TEXT_DETECTION
                    || type == Feature.Type.WEB_DETECTION) {
                builder.setMaxResults(10);
            }
            return builder.build();
        } catch (IllegalArgumentException e) {
            log.warn("지원하지 않는 Vision feature 요청: {}. LABEL_DETECTION으로 대체합니다.", featureName);
            return DEFAULT_LABEL_FEATURE;
        }
    }

    private Image buildImage(ImageRecognitionRequestDto request) {
        if (request != null && StringUtils.hasText(request.getImageBase64())) {
            byte[] decoded;
            try {
                decoded = Base64.getDecoder().decode(request.getImageBase64());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_FORMAT, "Base64 형식이 잘못되었습니다.");
            }

            if (decoded.length > MAX_IMAGE_BYTES) {
                throw new BusinessException(ErrorCode.OUT_OF_RANGE, "이미지 크기가 5MB를 초과했습니다.");
            }

            log.debug("Base64 이미지 크기(bytes): {}", decoded.length);
            return Image.newBuilder()
                    .setContent(ByteString.copyFrom(decoded))
                    .build();
        }

        if (request != null && StringUtils.hasText(request.getImageUrl())) {
            return Image.newBuilder()
                    .setSource(ImageSource.newBuilder().setImageUri(request.getImageUrl()))
                    .build();
        }

        throw new BusinessException(ErrorCode.MISSING_FIELD, "imageUrl 또는 imageBase64를 제공해야 합니다.");
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
