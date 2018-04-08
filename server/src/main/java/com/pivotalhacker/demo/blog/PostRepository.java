package com.pivotalhacker.demo.blog;

import org.springframework.data.repository.PagingAndSortingRepository;

public interface PostRepository extends PagingAndSortingRepository<Post, Long> {
}
