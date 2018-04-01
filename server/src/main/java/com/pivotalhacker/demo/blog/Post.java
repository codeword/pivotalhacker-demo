package com.pivotalhacker.demo.blog;

import lombok.Data;

import javax.persistence.*;

@Data
@Entity
@Table(name = "posts")
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String title;
    private String body;

    private Post() {}

    public Post(String title, String body) {
        this.title = title;
        this.body = body;
    }
}
