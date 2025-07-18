package com.example.tech.service;

import com.example.tech.dto.ReviewScoreDTO;
import com.example.tech.dto.request.ReviewScoreRequest;
import com.example.tech.entity.ArticleEntity;
import com.example.tech.entity.ReviewScoreEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.ArticleRepository;
import com.example.tech.repository.ReviewScoreRepository;
import com.example.tech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewScoreService {
    private final ReviewScoreRepository reviewScoreRepository;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;

    public void postReviewScore(ReviewScoreRequest request, String userEmail) {
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = user.getId();

        Optional<ReviewScoreEntity> existing = reviewScoreRepository.findByUserIdAndArticle_Id(userId, request.getArticleId());

        if(existing.isPresent()) {
            throw new RuntimeException("既にレビュー済みです");
        }

        //TODO
        ArticleEntity article = articleRepository.findById(request.getArticleId())
                .orElseThrow(() -> new RuntimeException("記事が見つかりません、"));

        ReviewScoreEntity entity = new ReviewScoreEntity();
        entity.setArticle(article);

        //entity.getArticle().setId(request.getArticleId());

        //entity.setArticleId(request.getArticleId());

        entity.setUserId(userId);
        entity.setScore(request.getScore());

        reviewScoreRepository.save(entity);
    }

    public ReviewScoreDTO getMyScore(Long articleId, String userEmail) {
        UserEntity user = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));
        Long userId = user.getId();

        Optional<ReviewScoreEntity> scoreOpt = reviewScoreRepository.findByUserIdAndArticle_Id(userId,articleId);

        return scoreOpt.map(this::convertToDTO).orElse(null);
    }

    private ReviewScoreDTO convertToDTO(ReviewScoreEntity entity) {
        ReviewScoreDTO dto = new ReviewScoreDTO();
        dto.setId(entity.getId());
        dto.setArticleId(entity.getArticle().getId());
        dto.setUserId(entity.getUserId());
        dto.setScore(entity.getScore());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;

    }

    public List<ReviewScoreDTO> getAllReviewScore(Long articleId) {
        List<ReviewScoreEntity> reviewScoreEntities = reviewScoreRepository.findScoresByArticleId(articleId);

        return reviewScoreEntities
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public void putReviewScore(ReviewScoreRequest request, String userEmail) {
        UserEntity userEntity = userRepository.findUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

        Long userId = userEntity.getId();

        Optional<ReviewScoreEntity> existingOpt = reviewScoreRepository.findByUserIdAndArticle_Id(userId, request.getArticleId());

        if(existingOpt.isPresent()) {
            ReviewScoreEntity entity = existingOpt.get();
            entity.setScore(request.getScore());
            entity.setUpdatedAt(LocalDateTime.now());
            reviewScoreRepository.save(entity);
        } else {
            throw new RuntimeException("レビューが存在しません。");
        }

    }

}
