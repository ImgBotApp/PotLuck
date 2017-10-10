function addModals() {
    $('.content').append('<!-- Recipe View Modal Structure -->\n' +
        '    <div id="recipe_modal" class="modal modal-fixed-footer bottom-sheet">\n' +
        '        <div class="modal-content">\n' +
        '            <div class="modal-header">\n' +
        '                <h3 class="modal-title" id="modalTitle"></h3>\n' +
        '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
        '                    <span aria-hidden="true">&times;</span>\n' +
        '                </button>\n' +
        '            </div>\n' +
        '            <div class="modal-body">\n' +
        '                <h4>Ingredients</h4>\n' +
        '                <ul id="ing" class="ingredients browser-default">\n' +
        '\n' +
        '                </ul>\n' +
        '                <h4>Methods</h4>\n' +
        '                <ul id="method" class="browser-default">\n' +
        '\n' +
        '                </ul>\n' +
        '                <h4>Rate this recipe</h4>\n' +
        '                <div class="row w3-padding-32">\n' +
        '                    <div id="recipeLikeId" class="col-xs-6">\n' +
        '                        <button type="submit" class="btn btn-like w3-button w3-round w3-green">Like\n' +
        '                        </button>\n' +
        '                    </div>\n' +
        '                    <div id="recipeDislikeId" class="col-xs-6">\n' +
        '                        <button type="submit" class="btn btn-dislike w3-button w3-round w3-red">\n' +
        '                            Dislike\n' +
        '                        </button>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '        <div class="modal-footer">\n' +
        '            <button type="button" class="btn btn-secondary modal-close">Close</button>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '\n' +
        '    <!-- Search Modal Structure -->\n' +
        '    <div id="search_modal" class="modal bottom-sheet">\n' +
        '        <div class="modal-content">\n' +
        '            <h4>Search Result</h4>\n' +
        '        </div>\n' +
        '    </div>');
}

$(document).ready(() => {
    let search_modal_state = 'close';
    let recipe_modal_state = 'close';
    const search_modal = $('#search_modal');

    $('.modal').modal({
        ready: (modal, trigger) => {
            switch (modal.attr('id')) {
                case 'recipe_modal':
                    recipe_modal_state = 'open';
                    break;
                case 'search_modal':
                    search_modal_state = 'open';
                    break;
                default:
                    break;
            }
        },
        complete: (modal, trigger) => {
            switch (modal.attr('id')) {
                case 'recipe_modal':
                    recipe_modal_state = 'close';
                    break;
                case 'search_modal':
                    search_modal_state = 'close';
                    break;
                default:
                    break;
            }
        } // Callback for Modal close
    });

    $('input.search').on('input paste', () => {
        $.get('/search?q=' + $('input.search').val(), res => {
            const search_section = search_modal.find('> .modal-content').find('h4');

            if (res.recipes) {
                search_section.nextAll().remove();
                if (search_modal_state === 'close')
                    search_modal.modal('open');

                let last_recipe_id = null;
                let idx = 0;

                for (let key in res.recipes) {
                    if (res.recipes.hasOwnProperty(key)) {
                        const recipe = res.recipes[key];
                        if (idx > 0)
                            search_modal.find('> .modal-content').find('a[data-id=' + last_recipe_id + ']').after('<a href="#" data-id="' + recipe.id + '" class="chip recipe-wrapper"><img src="' + recipe.image + '" alt="Recipe">' + key + '</a>');
                        else
                            search_section.after('<a href="#" data-id="' + recipe.id + '" class="chip recipe-wrapper"><img src="' + recipe.image + '" alt="Recipe">' + key + '</a>');
                        last_recipe_id = recipe.id;
                        idx++;
                    }
                }
            } else {
                if (search_modal_state === 'open')
                    search_section.nextAll().remove();
            }
        })
    });

    let currentRec = null;

    $('.btn-like').click(e => {
        e.preventDefault();
        const rated_data = {
            0: {
                recipe: currentRec,
                rating: 1
            },
        };
        $.post('/polling', rated_data);
    });

    $('.btn-dislike').click(e => {
        e.preventDefault();
        const rated_data = {
            0: {
                recipe: currentRec,
                rating: 0
            }
        };
        $.post('/polling', rated_data);
    });

    $(document).on('click', '.recipe-wrapper', function (e) {
        e.preventDefault();

        if (search_modal_state === 'open')
            search_modal.modal('close');

        //open the modal
        $('#recipe_modal').modal('open');

        //clear the innerHTML
        $('#ing').html('');
        $('#method').html('');
        $('#modalTitle').html('');

        $.get('/get_recipe?id=' + $(e.currentTarget).attr('data-id'), function (data, status) {
            $('#ing').append(parseIngredients(data));
            $('#method').append(parseMethod(data));
            $('#modalTitle').append(data.title);
            currentRec = data._id;
        });
    });

    function parseIngredients(data) {
        let out = "";
        data.extendedIngredients.forEach(item => {
            out += '<li>' + item.originalString + '</li>'
        });
        return out;
    }

    function parseMethod(data) {
        return data.instructions;
    }
});