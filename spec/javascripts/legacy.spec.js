describe("when rendering legacy content", function(){

  var editor, element = $("<textarea>");

  it("should be able to create the required blocks from a piece of legacy JSON containing TextBlocks", function(){
    var legacy_json = {"data":[{"type":"text","dom":{"id":"sedit_block_0","class":"sedit_block text_block"},"data":{"text":"Here is block one\n\n\n\ncasdf\n\n"}},{"type":"text","dom":{"id":"sedit_block_1","class":"sedit_block text_block"},"data":{"text":"Et animi eum deleniti. Sapiente quis omnis nihil aspernatur quas voluptas est. Ut voluptas est vitae. Neque quod fuga cumque excepturi."}}]};
    element.val(JSON.stringify(legacy_json));
    editor = new SirTrevor.Editor({ el: element });
    
    expect(editor.blocks.length).toBe(2);
    expect(editor.blockCounts.Text).toBe(2);
  });
  
  it("should be able to create an image block from legacy JSON content", function(){
    var legacy_json = {"data":[{"type":"image","dom":{"id":"sedit_block_0","class":"sedit_block image_block","data-type":"image"},"data":{"file":{"url":"/image/file/64/c51fcf30bd12ed3a_6.jpg","article":{"url":"/image/file/64/article_c51fcf30bd12ed3a_6.jpg","width":580,"height":326},"article_update":{"url":"/image/file/64/article_update_c51fcf30bd12ed3a_6.jpg","width":311,"height":175},"category_article_update":{"url":"/image/file/64/category_article_update_c51fcf30bd12ed3a_6.jpg","width":265,"height":149},"image_update":{"url":"/image/file/64/image_update_c51fcf30bd12ed3a_6.jpg","width":624,"height":351},"category_image_update":{"url":"/image/file/64/category_image_update_c51fcf30bd12ed3a_6.jpg","width":560,"height":315},"top_category":{"url":"/image/file/64/top_category_c51fcf30bd12ed3a_6.jpg","width":304,"height":171},"story_highlight":{"url":"/image/file/64/story_highlight_c51fcf30bd12ed3a_6.jpg","width":138,"height":78},"thumbnail":{"url":"/image/file/64/thumbnail_c51fcf30bd12ed3a_6.jpg","width":80,"height":45},"top_article":{"url":"/image/file/64/top_article_c51fcf30bd12ed3a_6.jpg","width":224,"height":126},"top_article_small":{"url":"/image/file/64/top_article_small_c51fcf30bd12ed3a_6.jpg","width":144,"height":81},"mobile_article":{"url":"/image/file/64/mobile_article_c51fcf30bd12ed3a_6.jpg","width":480,"height":270}},"description":"Tempora perspiciatis.","caption":"Assumenda ex mollitia molestias.","credit":"Nisi."}}]};
    element.val(JSON.stringify(legacy_json));
    
    editor = new SirTrevor.Editor({ el: element });
    expect(editor.blocks.length).toBe(1);
    expect(editor.blocks[0].type).toBe("Image");
    expect(editor.blocks[0].$editor.find("img").length).toBe(1);
  });
  
  it("should be able to create a tweet block from legacy JSON content", function(){
    var legacy_json = {"data":[{"type":"tweet","dom":{"id":"sedit_block_0","class":"sedit_block tweet_block","data-type":"tweet"},"data":{"place":null,"possibly_sensitive":false,"retweet_count":0,"in_reply_to_screen_name":"missells_xo","id_str":"141522701050318848","geo":null,"coordinates":null,"retweeted":false,"in_reply_to_user_id":228120161,"created_at":"Tue Nov 29 14:23:35 +0000 2011","in_reply_to_status_id_str":"141521056363057152","in_reply_to_user_id_str":"228120161","contributors":null,"in_reply_to_status_id":141521056363057150,"source":"<a href=\"http://cotweet.com/?utm_source=sp1\" rel=\"nofollow\">CoTweet</a>","truncated":false,"id":141522701050318850,"favorited":false,"text":"Qui animi minima sunt. Ex neque doloremque error exercitationem est est et. Sint dolores magnam voluptas et. Unde consequuntur rerum accusan","user":{"default_profile":false,"profile_background_image_url_https":"https://si0.twimg.com/profile_background_images/340955887/ArgosHelpers.png","favourites_count":2,"profile_text_color":"333333","protected":false,"statuses_count":9941,"profile_background_image_url":"http://a2.twimg.com/profile_background_images/340955887/ArgosHelpers.png","time_zone":"London","name":"Moses Goodwin","id_str":"161296820","contributors_enabled":false,"verified":false,"profile_link_color":"0084B4","utc_offset":0,"created_at":"Wed Jun 30 13:50:34 +0000 2010","followers_count":2954,"profile_image_url_https":"https://si0.twimg.com/profile_images/1267789249/argosHelpers_normal.png","profile_image_url":"http://a2.twimg.com/profile_images/1267789249/argosHelpers_normal.png","description":"Quia voluptatem perspiciatis voluptas. Quam autem culpa. Temporibus et sed natus itaque quia. Aut quaerat consectetur id officia veniam at.","listed_count":32,"following":null,"profile_background_color":"C0DEED","screen_name":"richard.little","profile_background_tile":false,"profile_sidebar_fill_color":"DDEEF6","notifications":null,"default_profile_image":false,"follow_request_sent":null,"geo_enabled":false,"friends_count":1450,"profile_sidebar_border_color":"C0DEED","location":"","id":161296820,"is_translator":false,"show_all_inline_media":false,"lang":"en","profile_use_background_image":true,"url":"http://www.argos.co.uk"}}}]};
    element.val(JSON.stringify(legacy_json));
    
    editor = new SirTrevor.Editor({ el: element });
    expect(editor.blocks.length).toBe(1);
    expect(editor.blocks[0].type).toBe("Tweet");
  });

});