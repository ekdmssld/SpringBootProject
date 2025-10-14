package com.example.firstproject.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class PathVariableController {
    @GetMapping("pathshow")
    public String showView(){
        return"path/show";
    }

    @GetMapping("/function/{no}")
    public String selectFunction(@PathVariable Integer no){
        String view = null;
        switch(no){
            case 1:
                view = "path/function1";
                break;
            case 2:
                view = "path/function2";
                break;
            case 3:
                view = "path/function3";
                break;
        }
        return view;
    }

    @PostMapping(value="send", params="a")
    public String showAView(){
        return "submit/a";
    }
    @PostMapping(value="send", params="b")
    public String showBView(){
        return "submit/b";
    }@PostMapping(value="send", params="c")
    public String showCView(){
        return "submit/c";
    }

}
