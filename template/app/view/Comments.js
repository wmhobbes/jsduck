Ext.define('Docs.view.Comments', {

    singleton: true,
    commentIdMap: {},

    constructor: function() {

        var commentsMeta = [
            '<div class="comments first-child" id="comments-{id}">',
                '<a href="#" class="side expandComments"><span></span></a>',
                '<tpl if="num &gt; 0">',
                    '<a href="#" class="name expandComments">View {[values.num == 1 ? "1 comment" : values.num + " comments"]}</a>',
                '</tpl>',
                '<tpl if="num == 0">',
                    '<a href="#" class="name expandComments">No comments</a>',
                '</tpl>',
            '</div>'
        ];

        this.classCommentsTpl = Ext.create('Ext.XTemplate',
            '<div id="m-comment">',
                '<h3 class="members-title">Comments</h3>',
                commentsMeta.join(''),
            '</div>'
        );
        this.commentsMetaTpl = Ext.create('Ext.XTemplate', commentsMeta.join(''));

        this.memberCommentsTpl = Ext.create('Ext.Template',
            '<strong class="member-comments">{0}</strong>'
        );

        var commentTplHtml = [
            '<div class="comment" id="{id}">',
                '<div class="com-meta">',
                    '<img class="avatar" width="25" height="25" src="http://www.gravatar.com/avatar/{emailHash}',
                          '?s=25&amp;r=PG&amp;d=http://www.sencha.com/img/avatar.png">',
                    '<div class="author">{author}</div>',
                    '<tpl if="this.isMod()"><a href="#" class="del">Delete</a></tpl>',
                    '<div class="time">{[this.date(values.createdAt)]}</div>',
                    '<div class="vote">',
                        '<a href="#" class="up{[values.upVote ? " selected" : ""]}" title="Vote Up">&nbsp;</a>',
                        '<span class="score">{score}</span>',
                        '<a href="#" class="down{[values.downVote ? " selected" : ""]}" title="Vote Down">&nbsp;</a>',
                    '</div>',
                '</div>',
                '<div class="content">{contentHtml}</div>',
            '</div>'
        ];

        var commentTplMethods = {
            date: function(date) {
                return Ext.Date.format(new Date(date), 'm/d/y');
            },
            isMod: function() {
                return Docs.App.getController('Auth').currentUser.mod;
            }
        };

        this.commentsTpl = Ext.create('Ext.XTemplate',
            '<div class="comment-list">',
                '<tpl for=".">',
                    commentTplHtml.join(''),
                '</tpl>',
                '<div class="new-comment-wrap"></div>',
            '</div>',
            commentTplMethods
        );

        this.commentTpl = Ext.create('Ext.XTemplate',
            commentTplHtml.join(''),
            commentTplMethods
        );

        this.newCommentTpl = Ext.create('Ext.XTemplate',
            '<div class="new-comment">',
                '<tpl if="loggedIn">',
                    '<a href="#" class="new-comment-a"><span></span>Post a comment</a>',
                    '<form class="newCommentForm">',
                        '<textarea></textarea>',
                        '<div class="com-meta">',
                            '<img class="avatar" width="25" height="25"',
                                ' src="http://www.gravatar.com/avatar/{emailHash}?s=25&amp;r=PG&amp;d=http://www.sencha.com/img/avatar.png">',
                            '<div class="author">Logged in as {userName}</div>',
                            '<input type="submit" class="newCommentSubmit" value="Post comment" />',
                        '</div>',
                    '</form>',
                '</tpl>',
                '<tpl if="!loggedIn">',
                    '<a href="#" class="new-comment-a"><span></span>Please sign in to post a comment</a>',
                '</tpl>',
            '</div>'
        );
    },

    renderCommentMeta: function() {

        var clsName = Docs.App.getController('Classes').currentCls.name,
            elId = clsName.replace(/\./g, '-'),
            commentsMeta = Docs.App.getController('Comments').commentMeta;

        this.commentIdMap['comments-' + elId] = ['class', clsName, ''];

        this.classCommentsTpl.insertFirst(Ext.query('.members')[0], {
            num: commentsMeta[clsName] || 0,
            id: elId
        });

        Ext.ComponentQuery.query('classoverview toolbar')[0].insert(-2, {
            xtype: 'container',
            width: 24,
            margin: '0 4 0 0',
            cls: 'comment-btn',
            html: String(commentsMeta[clsName] || '0')
        });

        Ext.Array.each(Ext.query('.member a.name'), function(a) {

            var memberId = a.getAttribute('href').replace(/^.*\//, ''),
                memberEl = Ext.get(a).up('.member'),
                descriptionEl = memberEl.down('.long'),
                id = ('class-' + memberId).replace(/\./g, '-');

            if (commentsMeta[memberId]) {
                var member = Ext.get(a).up('.title');
                this.memberCommentsTpl.append(member, [commentsMeta[memberId]]);
            }

            this.commentsMetaTpl.append(descriptionEl, {
                num: commentsMeta[memberId] || 0,
                id: id
            });
            this.commentIdMap['comments-' + id] = ['class', clsName, memberEl.getAttribute('id')];

            var hoverMember = Ext.query('.hover-menu a[rel="' + memberId + '"]')
            // console.log(hoverMember); //'.hover-menu a[rel="' + memberId + '"]')

            // // Add to hover menu too
            // var hoverMember = Ext.query('.hover-menu a[rel="' + row.key[1] + '-' + row.key[2] + '-' + row.key[3] + '"]');
            // if (hoverMember && hoverMember[0]) {
            //     this.memberCommentsTpl.append(hoverMember[0], [row.value.num]);
            // }

        }, this);
    },

    updateCommentMeta: function() {

        var clsName = Docs.App.getController('Classes').currentCls.name,
            elId = clsName.replace(/\./g, '-'),
            commentsMeta = Docs.App.getController('Comments').commentMeta;

        var str = this.classCommentsTpl.apply({
            num: commentsMeta[clsName] || 0,
            id: elId
        })

        Ext.get('m-comment').replaceWith(str);

        Ext.get(Ext.query('#classcontainer .comment-btn')[0]).update(commentsMeta[clsName] || '0')
    },

    renderNewCommentForms: function() {
        var loggedIn = Docs.App.getController('Comments').loggedIn;
        Ext.Array.each(Ext.query('.new-comment-wrap'), function(newComment) {
            this.newCommentTpl.overwrite(newComment, Ext.Object.merge({
                loggedIn: loggedIn
            }, Docs.App.getController('Auth').currentUser));
        }, this);
    },

    showMember: function(cls, member) {

        var memberEl = Ext.get(member).down('.long'),
            id = ('class-' + cls + '-' + member).replace(/\./g, '-');

        if (!memberEl.hasCls('renderedComment')) {
            this.commentsMetaTpl.append(memberEl, {
                num: 0,
                id: id
            });
            memberEl.addCls('renderedComment');
            this.commentIdMap['comments-' + id] = ['class', cls, member];
        }
    }
});