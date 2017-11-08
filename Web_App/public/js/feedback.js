function addFeedback() {
    $('<div id="feedback-box">\n' +
        '\n' +
        '    <header class="clearfix">\n' +
        '\n' +
        '        <a href="#" class="feedback-close">x</a>' +
        '\n' +
        '        <h4>Tell us what you think</h4>\n' +
        '\n' +
        '    </header>\n' +
        '\n' +
        '    <div class="feedback">\n' +
        '\n' +
        '        <div class="feedback-area">\n' +
        '\n' +
        '        </div>\n' +
        '\n' +
        '        <div class="form-section">\n' +
        '            <fieldset>\n' +
        '                <label for="Email-addr">Email</label>\n' +
        '                <input type="email" class="form-control browser-default" id="Email-addr" placeholder="Email" autofocus>\n' +
        '\n' +
        '            </fieldset>\n' +
        '\n' +
        '            <fieldset>\n' +
        '                <label for="comments">Comments</label>\n' +
        '                <textarea type="text" class="form-control" id="comments" placeholder="Comments"></textarea>\n' +
        '            </fieldset>\n' +
        '\n' +
        '            <a type="submit" href="#" id="submit" class="btn btn-primary">Submit</a>\n' +
        '        </div>\n' +
        '\n' +
        '    </div>\n' +
        '\n' +
        '</div>').appendTo('body');

    $('#submit').click(e => {
        const formData = {};
        formData.Email = $('#Email-addr').val();
        formData.Comments = $('#comments').val();

        $.ajax({
            type: 'POST',
            url: routes.feedback.pathname,
            data: formData,
            dataType: 'json',
            success: res => {
                Materialize.toast(res.msg, 5000, 'teal');
            }
        });
    });

    $('#feedback-box').find('header').on('click', () => $('.feedback').slideToggle(300, 'swing'));

    $('.feedback-close').on('click', function (e) {

        e.preventDefault();
        $('#feedback-box').fadeOut(300);

    });
}