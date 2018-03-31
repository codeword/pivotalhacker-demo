package com.pivotalhacker.demo.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class RootController {

    @RequestMapping("")
    public String show() {
        return "root/show";
    }
}