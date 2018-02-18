(function (window) {
	'use strict';
	var $ = window.jQuery,
		console = window.console,
        location = window.location;
    
    function loadCropList () {
        var crop = [
            {"name": "Basil", "imgsrc": "../assets/img/basil.jpg"},
            {"name": "Bell Pepper", "imgsrc": "../assets/img/bellpepper.jpg"},
            {"name": "Carrot", "imgsrc": "../assets/img/carrot.jpg"},
            {"name": "Lettuce", "imgsrc": "../assets/img/lettuce.jpg"},
            {"name": "Onion", "imgsrc": "../assets/img/onion.png"},
            {"name": "Tomato", "imgsrc": "../assets/img/tomato.jpg"}
        ];
        
        $('.cropselection .croplist').empty();
        
        $.each(crop, function (i, field) {
            var div = $("<div></div>", {
                    "class": "col-md-2 crop",
                    "data-crop": field.name.toLowerCase()
                }),
                imgcontainer = $("<div></div", {
                    "class": "image-container"
                }),
                img = $("<img/>", {
                    "src": field.imgsrc
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
    
    $(document).on('click', '.crop', function () {
        $(this).toggleClass('selected');
    });
    
    $(document).ready(function () {
        console.log('READY');
        loadCropList();
    });

    $(window).on('hashchange', function () {
        console.log('LOL', location.hash); 
    });
	
}(this));