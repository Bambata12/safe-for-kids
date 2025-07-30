package com.kidcheck.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class StaticController {

    @RequestMapping(value = {"/"})
    public String index() {
        return "forward:/index.html";
    }
}
