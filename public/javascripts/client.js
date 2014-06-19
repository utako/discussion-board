function initialize () {  
  $.ajax({
    url: '/topics',
    type: 'GET',
    success: function(data) {
    }
  });
  
};

window.WikiProject = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {
    new window.WikiProject.Routers.AppRouter();
    Backbone.history.start();
  },
};

window.WikiProject.Routers.AppRouter = Backbone.Router.extend({
  routes: {
    "": "discussionShow",
    "topics": "discussionShow"
  },

  discussionShow: function() {
    var showView = new WikiProject.Views.discussionShow({
      collection: WikiProject.Collections.topics
    });
    this._swapView(showView);
    WikiProject.Collections.topics.fetch();
  },

  _swapView: function(view) {
    if (this.currentView) {
      this.currentView.remove();
    }
    this.currentView = view;
    $("#topics-container").html(view.render().$el);
  },
});


window.WikiProject.Models.Topic = Backbone.Model.extend({
  urlRoot: '/topics',

  comments: function() {
    if (!this._comments) {
      this._comments = {};
    }
    return this._comments;
  },
  
  parse: function(response) {
    var topic = this;
    _(response.responses).each(function(response) {
      topic.comments()[response.id] = new WikiProject.Models.Comment(response);
    });
    _(topic.comments()).each(function(comment) {
      if (comment.get('parentid') == 0) {
        topic.parentComment = comment;
      } else {
        var parentID = comment.get('parentid');
        if (typeof topic.comments()[parentID] !== 'undefined') {
          topic.comments()[parentID].childComments().add(comment);
        }
      }
    })
    return response;
  }  
});

window.WikiProject.Collections.Topics = Backbone.Collection.extend({
  url: '/topics',
  model: WikiProject.Models.Topic,
});
window.WikiProject.Collections.topics = new WikiProject.Collections.Topics();

window.WikiProject.Models.Comment = Backbone.Model.extend({

  childComments: function() {
    if (!this._childComments) {
      this._childComments = new WikiProject.Collections.childComments([], {comment: this});
    }
    return this._childComments;
  },
});


window.WikiProject.Collections.Comments = Backbone.Collection.extend({
  model: WikiProject.Models.Comment,
});

window.WikiProject.Collections.childComments = Backbone.Collection.extend({
  model: WikiProject.Models.Comment,
});



window.WikiProject.Views.discussionShow = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.collection, "sync", this.render);
  },
    
  events: {
    "click .topic-header": "toggleBodyShow",
    "hover .time": "toggleTimeShow",
    "click .comment-button": "showCommentForm",
    "click #cancel": "hideCommentForm",
    "click .submit-form": "handleCommentSubmission"
  },
  
  render: function() {
    var view = this;

    var topicCount = 0;
    _(this.collection.models).each(function(topic) {
      var age = view.timeAgo(topic.parentComment.get('age'));
      var topicShowMarkup = $('#topic-show').html();
      var compiledTopicShow = _.template(topicShowMarkup, {
        age: age,
        topicCount: topicCount, 
        topic: topic
      });
      view.$el.append(compiledTopicShow);
      
      if (typeof topic.parentComment.childComments() !== 'undefined') {
        view.addChildComments(
          topic.parentComment, topic.parentComment.childComments()
        );        
      }
      topicCount += 1;
    })
    return this;
  },
  
  timeAgo: function(secondsPassed) {
    var lastTime = moment().subtract('seconds', secondsPassed);
    var now = moment();
    return lastTime.from(now);
  },
  
  timeFromNow: function(secondsPassed) {
    return moment().subtract('seconds', secondsPassed).format('LLL');
  },
  
  currentTime: function() {
    return moment();
  },
  
  toggleBodyShow: function(event) {
    var idArray = $(event.currentTarget)[0].id.split("-");
    var elNumber = idArray[idArray.length-1];
    
    if ( $("#topic-body-" + elNumber).is( ":hidden" ) ) {
      $("#topic-body-" + elNumber).slideDown();
      $("#topic-glyph-" + elNumber).replaceWith(
        "<span class='glyphicon glyphicon-chevron-down' id='topic-glyph-" + 
        elNumber + "'/>"
      );
    } else {
      $("#topic-body-" + elNumber).slideUp();
      $("#topic-glyph-" + elNumber).replaceWith(
        "<span class='glyphicon glyphicon-chevron-right' id='topic-glyph-" + 
        elNumber + "'/>"
      );
    }
  },

  showCommentForm: function(event) {
    var parentID = $(event.currentTarget)[0].id.split("-")[2];
    $(event.currentTarget).replaceWith(
      "<div><form class='comment-form'>" + 
      "<input type='text' class='comment-form form-control' id='comment-form-" + 
      parentID + "' name='comment[response]'>" +
      "<a id='cancel'>Cancel</a>" +  
      "<input class='submit-form' type='submit' value='Submit'>" + 
      "</form></div>"
    );
  },
  
  hideCommentForm: function(event) {
    $(event.target.parentElement.parentElement.parentElement).replaceWith(
      "<div class='comment-form'><a class='comment-button'>Reply</a></div>"
    );
  },
  
  handleCommentSubmission: function(event) {
    event.preventDefault();
    var parentID = $(event.currentTarget.parentElement).children()[0].id.split("-")[2];
    var postText = $(event.currentTarget.parentElement).serializeJSON().comment.response;
    var id = Math.floor(Math.random()*100)+135;
    var bootstrappedUser = "Utako";
    var age = 20;
    var newComment = new WikiProject.Models.Comment({
      id: id,
      parentid: parentID,
      age: age,
      author: bootstrappedUser,
      posttext: postText
    });
    $(event.currentTarget.parentElement).replaceWith(
        "<div class='comment-form id='comment-form-" + parentID + 
        "'><a class='comment-button'>Reply</a></div>"
    );
    $("#comment" + parentID).append(
      "<ul id='subcomment" + parentID + "'></ul>"
    );
    this.addChildComment(parentID, newComment);
    $('html, body').animate({
      scrollTop: $("#comment"+id).offset().top-16
    }, 500);
  },
  
  addChildComments: function(parentComment, childComments) {
    var view = this;
    if (childComments.models.length > 0) {
      $("#comment" + parentComment.get('id')).append(
        "<ul id='subcomment" + parentComment.get('id') + "'></ul>"
      );
    }
    _(childComments.models).each(function(comment) {
      var parentCommentId = parentComment.get('id');
      view.addChildComment(parentCommentId, comment);
      
      if (typeof comment.childComments() !== 'undefined') {
        view.addChildComments(comment, comment.childComments());
      }
    });
  },
  
  addChildComment: function(parentCommentId, comment) {
    var view = this;
    
    var age = view.timeAgo(comment.get('age'));
    var commentShowMarkup = $('#comment-show').html();
    var compiledCommentShow = _.template(commentShowMarkup, {
      age: age,
      comment: comment, 
    });
    $("#subcomment" + parentCommentId).append(compiledCommentShow);
  }
  
});
