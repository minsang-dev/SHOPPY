package ssafy.rtc.shoppy.settlement.service;

import io.awspring.cloud.s3.S3Template;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ssafy.rtc.shoppy.global.exception.BusinessException;
import ssafy.rtc.shoppy.global.exception.ErrorCode;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final S3Template s3Template;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT);
        }

        try {
            // 유니크한 파일명 생성
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String savedFilename = "receipts/" + UUID.randomUUID().toString() + extension;

            // S3 업로드
            // S3Template은 내부적으로 Content-Type 등을 자동 처리
            s3Template.upload(bucketName, savedFilename, file.getInputStream());

            // 업로드된 URL 반환
            // public access가 허용된 버킷이라 가정하거나, presigned url을 생성해야 함
            // 여기서는 표준 S3 URL 형식을 반환
            String fileUrl = s3Template.download(bucketName, savedFilename).getURL().toString();
            
            // 만약 S3Template.download().getURL()이 presigned가 아니라면 직접 구성
            // https://{bucket}.s3.{region}.amazonaws.com/{key}
            // 혹은 cloudfront 등을 사용한다면 그에 맞게 변경 필요
            
            log.info("S3 Upload Success: {}", fileUrl);
            return fileUrl;

        } catch (IOException e) {
            log.error("S3 Upload Failed", e);
            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.", e);
        }
    }
}
