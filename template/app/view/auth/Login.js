Ext.define('Docs.view.auth.Login', {
    extend: 'Ext.container.Container',
    alias: 'widget.authentication',

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when the user clicks 'login'
             */
            "login",

            /**
             * @event
             * Fired when the user clicks 'logout'
             */
            "logout",

            /**
             * @event
             * Fired when the login form is submitted
             * @param {String} username
             * @param {String} password
             */
            "authenticate"
        );
        this.callParent(arguments);
    },

    showLogin: function() {
        this.update([
            '<form id="loginForm" style="visibility: none;">',
                '<input class="username" type="text" name="username" placeholder="Username" />',
                '<input class="password" type="password" name="password" placeholder="Password" />',
                '<label><input type="checkbox" name="remember" /> Remember Me</label>',
                '<input class="submit" type="submit" value="Sign in" />',
                ' or ',
                '<a class="register" href="http://www.sencha.com/forum/register.php" target="_blank">Register</a>',
            '</form>'
        ].join(''));

        Ext.get(Ext.query('#loginForm input[name=username]')[0]).focus();

        Ext.get('loginForm').addListener('submit', function(e, el) {

            var username = Ext.get(Ext.query('#loginForm input[name=username]')[0]).getValue(),
                password = Ext.get(Ext.query('#loginForm input[name=password]')[0]).getValue(),
                remember = Boolean(Ext.get(Ext.query('#loginForm input[name=remember]')[0]).getAttribute('checked'));

            this.fireEvent('login', username, password, remember);
        }, this, {
            preventDefault: true
        });
    },

    showLoggedIn: function(username) {
        this.update('Welcome, ' + username + ' | <a href="#" class="logout">Logout</a>');
    },

    showLoggedOut: function(username) {
        this.update('<a href="#" class="login">Sign in / Register</a>');
    }
});
