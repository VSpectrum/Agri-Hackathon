(function (window) {
	'use strict';
	var $ = window.jQuery,
		console = window.console,
        location = window.location,
        GLOBAL_NAI = "../assets/img/nai.jpg",
        GLOBAL_ARR = [];
    
    function loadCropList () {
        var crop = [
            {"name": "Basil", "imgsrc": "../assets/img/basil.jpg"},
            {"name": "Bell Pepper", "imgsrc": "../assets/img/bellpepper.jpg"},
            {"name": "Carrot", "imgsrc": "../assets/img/carrot.jpg"},
            {"name": "Lettuce", "imgsrc": "../assets/img/lettuce.jpg"},
            {"name": "Onion", "imgsrc": "../assets/img/onion.png"},
            {"name": "Tomato", "imgsrc": "../assets/img/tomato.jpg", "intercrop": ["Carrot, Eggplant"]},
            {"name": "Artichoke", "imgsrc": ""}
        ];
        
        $('.cropselection .croplist').empty();
        
        $.each(crop, function (i, field) {
            var div = $("<div></div>", {
                    "class": "col-md-2 crop",
                    "data-crop": field.name.toLowerCase(),
                    "data-crop-img": field.imgsrc !== '' ? field.imgsrc : GLOBAL_NAI
                }),
                imgcontainer = $("<div></div", {
                    "class": "image-container"
                }),
                img = $("<img/>", {
                    "src": field.imgsrc !== '' ? field.imgsrc : GLOBAL_NAI
                }),
                label = $("<label></label>"),
                input = $("<input/>", {
                    "type": "checkbox",
                    "name": "crop_" + (field.name.indexOf(' ') < 0 ? field.name.toLowerCase() : field.name.split(' ').join('_').toLowerCase())
                });
            
            imgcontainer.append(img);
            label.append(input, field.name);
            div.append(imgcontainer, label)
            $('.croplist').append(div);
        });
    }
    
    function loadValveList (crop) {
        var option = [
            {"valve": 976, "id": 01}, 
            {"valve": 456, "id": 56},
            {"valve": 76535, "id": 34},
            {"valve": 34568, "id": 66},
            {"valve": 87854, "id": 87},
            {"valve": 4356, "id": 08},
            {"valve": 456, "id": 013},
            {"valve": 6567, "id": 76},
            {"valve": 43, "id": 885}
        ];
        $('.valveassignment .valvelist').empty();
        
        $.each(crop, function (i, field) {
            var div = $("<div></div>", {"class": "col-md-4 tile-wrapper"}),
                article = $("<article></article>", {"class": "tile index_"+i, "data-crop": field.name}),
                div2 = $("<div></div>", {"class": "row"}),
                aside = $("<aside></aside>", {"class": "col-md-4"}),
                imgcontainer = $("<div></div>", {"class": "image-container"}),
                img = $("<img/>", {"src": field.imgsrc}),
                div3 = $("<div></div>", {"class": "col-md-8"}),
                h2 = $("<h2></h2>"),
                label = $("<label></label>"),
                select = $('<select></select>', {"data-index": "index_"+i}),
                op = $("<option value='default'>Choose</option>"),
                input =$("<input/>", {"type": "checkbox", "style": "display: none;", "id": "index_"+i});
            
            select.append(op);
            
            $.each(option, function (i, field) {
                var opt = "<option value='"+field.id+"'>" +field.valve+ "</option>";
                select.append(opt);
            });
            
            imgcontainer.append(img);
            aside.append(imgcontainer);
            
            h2.append(field.name);
            label.append("Valve No.");
            div3.append(h2, label, select);
            
            div2.append(aside, div3);
            article.append(div2, input);
            div.append(article);
            $('.valvelist').append(div);
        });
    }
    
    function route () {
        switch(location.hash) {
            case '':
            case '#/':
            case '#/home':
                $.get('../views/home.html', function (data) {
                    $('body').attr({'class': 'homepage'}).html(data);
                });
                break;
            case '#/crops':
                var oncomplete = $.get('../views/crops.html', function (data) {
                    $('body').attr({'class': 'cropselection'}).html(data);
                });
                
                oncomplete.then(function () {
                    loadCropList();
                });
                break;
            case '#/valves':
                var oncomplete = $.get('../views/valves.html', function (data) {
                    $('body').attr({'class': 'valveassignment'}).html(data);
                });
                
                oncomplete.then(function () {
                    loadValveList(GLOBAL_ARR);
                });
                break;   
            case '#/success':
                $.get('../views/success.html', function (data) {
                    $('body').attr({'class': 'success'}).html(data);
                });
                
                break;
        }
    }
    
    function success () {
        location.href = "#/success";
    }
    
    $(document).on('input', '.filter input[type="text"]', function () {
        var crop = $('.croplist .crop'),
            str = $(this).val().toLowerCase();
        
        if (str !== '') {
           $.each(crop, function (i, field) {
                var name = $(field).attr('data-crop');

                if (name.indexOf(str) >= 0) {
                    $(field).show();
                } else {
                    $(field).hide();
                }
            }); 
        } else {
            crop.show();
        }
        
    });
    
    $(document).on('click', '.next', function (e) {
        if ($(this).hasClass('disabled')) {
            console.log('Disabled No Action Taken...');
            e.preventDefault();
        } else {
            e.preventDefault();
            var selected = $('.selected'),
                crops = [];
            
            $.each(selected, function (i, field) {
                var obj = {
                    id: "",
                    name: $(field).attr('data-crop').replace(/\w\S*/g, function(txt){ 
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    }),
                    imgsrc: $(field).attr('data-crop-img')
                };
                
                crops.push(obj);
            });
            
            location.href = '#/valves';
            GLOBAL_ARR = crops;
        }
    });
    
    $(document).on('click', '.submit', function (e) {
        if ($(this).hasClass('disabled')) {
            console.log('Disabled No Action Taken...');
            e.preventDefault();
        } else {
            e.preventDefault();
            var crop = $('.tile');
            
            $.each(crop, function (i, field) {
                var cp = $(field).attr('data-crop'),
                    vv = $(field).attr('data-valve');
                
                console.log(cp, vv);
                
                success();
            });
        }
    });
    
    $(document).on('click', '.crop', function () {
        $(this).toggleClass('selected');
        
        var selected = $('.selected').length > 0 ? true : false;
        
        if (selected) {
            $('.next').removeClass('disabled');
        } else {
            $('.next').addClass('disabled');
        }
    });
    
    $(document).on('change', '.tile select', function () {
        var vassign, cropcount;
        
        if ($(this).val() !== 'default') {
            $('#'+ $(this).attr('data-index')).prop("checked", true);
            $('article.tile.' + $(this).attr('data-index')).attr('data-valve', $(this).val());
        } else {
            $('#'+ $(this).attr('data-index')).prop("checked", false);
            $('article.tile.' + $(this).attr('data-index')).attr('data-valve', '');
        }
        
        vassign = $('.tile input[type="checkbox"]:checked').length;
        cropcount = $('.tile input[type="checkbox"]').length;
        
        if (cropcount === vassign) {
            $('.submit').removeClass('disabled');
        } else {
            $('.submit').addClass('disabled');
        }
    });
    
    $(document).ready(function () {
        route();
    });

    $(window).on('hashchange', function () {
        route();
    });
	
}(this));