/**
 * Created by yokasha on 10/2/2016.
 */


// to do:
//check if fields are valid or not

$(document).ready(function(){

    $('.btn-search').click(function(e){ // Handle event when there is a a click on the class
        var query = $('.search-query').val(); // Set query to the value that's in the text field of class
        var type = $('.btn-search').attr('data-type'); // Set type to html attribute "data-type" of class
        var user = $('.user-email').attr('user-email'); // Set user to html attribute "user-email" of class
        query = query.split(' ').join('+'); // Convert spaces in "query" to pluses
        var btn_url = $('.btn-search').attr('href');
        var data = { type:type, user : user, query : query };
        $.post(btn_url,data);
    });

    $('.btn-update-prof').click(function(event){ // Update Profile button
        var email = $('.form-email').val();
        var name =  $('.form-name').val();
        var pass =  $('.form-pass').val();
        var data = { email : email, name : name, pass: pass };
        $.post('/profile', data);
        event.preventDefault();
    });



    $('.btn-signup').click(function(event){ // Set initial name
        var name =  $.trim($('.form-name').val());
        $.post('/signup', name);
    });

    $('.btn-post').click(function(e){
        var type = $('.btn-post').attr('data-type');
        var user = $('.user-email').attr('user-email');
        var btn_url = $('.btn-post').attr('href');
        var data = {};
        if(type.localeCompare("pet")){
            var description = $('.pet-description').val();
            var category = $('.pet-category').text();
            var title = $('.pet-title').val();
            data = {type:type,user:user,description: description,category:category,title:title};
        }
        else if(type.localeCompare("car")){
            var title = $('.car-title').val();
            var model = $('.car-model').val();
            var location = $('.car-location').val();
            var rate = $('.car-rate').val();
            var date = $('.car-date-av').val();
            data = {type:type,user:user,title:title,model:model,location:location,rate:rate, date_av :date};
        }
        else if(typ.localeCompare("file")){
            data = {type:type,user:user};
        }
        $.post(btn_url,data);
    });

    $('.btn-remove').click(function(e){
        var type = $('.btn-remove').attr('data-type');
        var user = $('.user-email').attr('user-email');
        var btn_url = $('.btn-remove').attr('href');
        var type_title = $('.btn-remove-title').val();
        var id = $('.post-id').attr(id);
        var data = {type:type,user:user,title:type_title,id:id};


        if(type.localeCompare("pet")){
            var category = $('.pet-category').val();
            data.push({catergory:category});
        }else if(type.localeCompare("car")){
            var model = $('.car-model').val();
            var location = $('.car-location').val();
            var rate = $('.car-rate').val();
            var date = $('.car-date-av').val();
            data.push({model:model,location:location,rate:rate,date:date});
        }else if(type.localeCompare("file")){
            var file_name = $('.file-name').attr('file-name');
            data.push({file_name:file_name});
        }
        $.post(btn_url,data);
    });




});


