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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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

        // ??? ??? ??
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String savedFilename = "receipts/" + UUID.randomUUID().toString() + extension;

        try {
            // S3 ???
            s3Template.upload(bucketName, savedFilename, file.getInputStream());

            // ???? URL ??
            String fileUrl = s3Template.download(bucketName, savedFilename).getURL().toString();
            log.info("S3 Upload Success: {}", fileUrl);
            return fileUrl;

        } catch (Exception e) {
            // S3 ?? ? ?? ???? ?? (??/???)
            try {
                Path uploadDir = Paths.get(System.getProperty("user.home"), "shoppy-uploads", "receipts");
                Files.createDirectories(uploadDir);
                Path target = uploadDir.resolve(savedFilename.substring("receipts/".length()));
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                String localPath = target.toAbsolutePath().toString();
                log.warn("S3 upload failed, saved locally: {}", localPath, e);
                return localPath;
            } catch (IOException ioe) {
                log.error("Local save failed", ioe);
                throw new RuntimeException("?? ??? ? ??? ??????.", ioe);
            }
        }
    }
}
