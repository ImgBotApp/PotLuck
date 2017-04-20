/**
 * Created by Omar on 10/24/2016.
 */

$(document).ready(function () {
    $('.btn-update-prof').click(function (event) { // Handle event when there is a a click on the class
        var email = $('.form-email').val(); // Set email to the value that's in the text field
        var name = $('.form-name').val(); // Set name to the value that's in the text field
        var pass = $('.form-pass').val(); // Set pass to the value that's in the text field
        email = email.length < 1 ? user.local.email : email;
        name = name.length < l ? user.local.name : name;
        var data = {email: email, name: name, pass: pass}; // Convert to JSON string
        $.post('/profile', data); // Post to profile
        event.preventDefault();
        window.location.replace(window.location.origin + "/profile");
    });

    $('.btn-like').click(function (event) {
        var recipeId = $(this).attr('recipe-id');
        var rating = 1;
        var data = {recipeId: recipeId, rating: rating};
        $.post('/polling', data);
        event.preventDefault();
        window.location.replace(window.location.origin + "/polling");
    });

    $('.btn-dislike').click(function (event) {
        var recipeId = $(this).attr('recipe-id');
        var rating = 0;
        var data = {recipeId: recipeId, rating: rating};
        $.post('/polling', data);
        event.preventDefault();
        window.location.replace(window.location.origin + "/polling");
    });

    $('.btn-finish').click(function (event) {
        window.location.replace(window.location.origin + "/index");
    });

    $('#recommendations').click(function () {
        if ($('#manipulate').hasClass('toggle_off')) {
            $('.jumbotron').animate({height: '500px'}, function () {
                /*var s = $('<div style="color: whitesmoke">Test.</div>');
                 $('#manipulate').append(s);
                 s.attr('id', 'suggestions');
                 s.attr('class', 'w3-animate-bottom');*/
                $.get("/get_suggestions", function (data, status) {
                    console.log(status);
                    $('#suggestions').show();
                    $('#Sugg0').append($('<div class="w3-card-4" style="width:65%; background-color: rgba(255,255,255,1)">' +
                        '<img src="' + data[0].image + '" style="width:100%"><div class="w3-container w3-center">' +
                        '<p style="font-size: medium; padding-top: 10px">' + data[0].title + '</p></div></div>'));
                    $('#Sugg1').append($('<div class="w3-card-4" style="width:65%; background-color: rgba(255,255,255,1)">' +
                        '<img src="' + data[1].image + '" style="width:100%"><div class="w3-container w3-center">' +
                        '<p style="font-size: medium; padding-top: 10px">' + data[1].title + '</p></div></div>'));
                    $('#Sugg2').append($('<div class="w3-card-4" style="width:65%; background-color: rgba(255,255,255,1)">' +
                        '<img src="' + data[2].image + '" style="width:100%"><div class="w3-container w3-center">' +
                        '<p style="font-size: medium; padding-top: 10px">' + data[2].title + '</p></div></div>'));
                })
            }).removeClass('toggle_off').addClass('toggle_on');
        } else {
            $('#suggestions').remove();
            $('.jumbotron').animate({height: '300px'}).removeClass('toggle_on').addClass('toggle_off');
        }
    });
});