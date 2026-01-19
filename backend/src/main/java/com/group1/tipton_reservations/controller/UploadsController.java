package com.group1.tipton_reservations.controller;

import java.time.Duration;
import java.util.UUID;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

@RestController
public class UploadsController {
    private final S3Presigner presigner;
    private final String bucketName = "20251117-ey-project2-group3-assets";

    public UploadsController(S3Presigner presigner) {
        this.presigner = presigner;
    }



    @PostMapping("/uploads/presign")
    public PresignResponse presign(@RequestBody PresignRequest req) {

        String key = "images/" + UUID.randomUUID();

        PutObjectRequest objectRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(req.getContentType())
            .build();

        PutObjectPresignRequest presignRequest =
            PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5))
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presigned =
            presigner.presignPutObject(presignRequest);

        return new PresignResponse(presigned.url().toString(), key);
    }

}
