function addNav(routes) {
    $('.content').prepend('<!------------------------------------------------->\n' +
        '    <!--                 NAVBAR                      -->\n' +
        '    <!------------------------------------------------->\n' +
        '    <div class="container">\n' +
        '\n' +
        '        <!-- Static navbar -->\n' +
        '        <nav class="navbar navbar-default navbar-fixed-top">\n' +
        '            <div class="container">\n' +
        '                <div class="navbar-header">\n' +
        '                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar"\n' +
        '                            aria-expanded="false" aria-controls="navbar">\n' +
        '                        <span class="sr-only">Toggle navigation</span>\n' +
        '                        <span class="icon-bar"></span>\n' +
        '                        <span class="icon-bar"></span>\n' +
        '                        <span class="icon-bar"></span>\n' +
        '                    </button>\n' +
        '                    <a class="navbar-brand" href="' + routes.intro.pathname + '">PotLuck</a>\n' +
        '                    <!-- Search Bar -->\n' +
        '                    <section class="searcbar">\n' +
        '                        <div class="row">\n' +
        '                            <div class="col s12">\n' +
        '                                <div class="row">\n' +
        '                                    <div class="input-field col s12">\n' +
        '                                        <i class="material-icons prefix">search</i>\n' +
        '                                        <input id="autocomplete-input" type="text" class="autocomplete-content search">\n' +
        '                                        <label for="autocomplete-input">Find a recipe</label>\n' +
        '                                    </div>\n' +
        '                                </div>\n' +
        '                            </div>\n' +
        '                        </div>\n' +
        '                    </section>\n' +
        '                </div>\n' +
        '                <div id="navbar" class="navbar-collapse collapse">\n' +
        '                    <ul class="nav navbar-nav navbar-right browser-default"></ul>\n' +
        '                </div><!--/.nav-collapse -->\n' +
        '            </div><!--/.container-fluid -->\n' +
        '        </nav>\n' +
        '    </div> <!-- /container -->');
}
