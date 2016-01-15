(function () {
  "use strict";
  window.thisAppId = kintone.app.getId();

  var scenes = ['mobile.app.record.index.show', 'app.record.index.show']
  kintone.events.on(scenes, function(event){ 
    initIndex(event);
  });
})();

function initIndex(event) {
  $('.box-gaia').prepend('<div class="kintone_portal"></div>');
  $('.listview-gaia').prepend('<div class="kintone_portal"></div>');
  var $html = $('.kintone_portal');
  var records = event.records;
  if(records){ // PC
    init(records);
  } else { // mobile
    var url = kintone.api.url('/k/v1/records', true);
    kintone.api(url, 'GET', {app: window.thisAppId}, function(resp) {
      init(resp.records);
    });
  }
}

function init(records) {
  var $html = $('.kintone_portal');
  for(var i = 0; i < records.length; i++) {
    var record = records[i]
    var id  = record['$id']['value'];
    var appId  = record['appId']['value'];
    var reportId  = record['reportId']['value'];
    var query  = record['query']['value'];
    var title = record['title']['value'];
    var fields = record['fields']['value'].split(',');
    var space  = record['space']['value'];
    var width  = 600;
    if(reportId){
      $html.append('<div style="float:left; width:'+width+'px;"><iframe width="100%" height="600" frameborder="0" src="/k/'+appId+'/report/portlet?report='+reportId+'"></iframe></div>');
    } else if(space && space.replace(/<div>/, '').replace(/<\/div>/, '').replace(/<br \/>/, '').length){
      var editLink = '<a href="https://ruffnote.cybozu.com/k/'+window.thisAppId+'/show#record='+id+'&mode=edit">編集</a>';
      $html.append('<div style="float:left; width:'+width+'px;">'+space+editLink+'</div>');
    } else {
      $html.append('<div id="kintone_portal_table_'+id+'" style="float:left; width:'+width+'px;">※取得中...</div>');
      initTable(id, fields, {app: appId, query: query}, title);
    }
  }
  var url = kintone.api.url('/k/v1/apps', true);
  $html.append('<div id="kintone_portal_apps" style="clear:both;"></div>');
  var fields = record['fields']['value'].split(',');
  kintone.api(url, 'GET', {}, function(resp) {
    $("#kintone_portal_apps").html(renderTable('アプリ一覧', fields, resp.apps));
  });
}

function initTable(id, fields, params, title) {
  var url = kintone.api.url('/k/v1/records', true);
  kintone.api(url, 'GET', params, function(resp) {
    var records = resp.records;
    var url = kintone.api.url('/k/v1/app/form/fields', true);
    var options = null;
    var appId = params.app;
    kintone.api(url, 'GET', {app: params.app}, function(resp){
      if(resp.properties['status']) {
        options = {status: resp.properties['status'].options};
      }
      $("#kintone_portal_table_"+id).html(
        renderTable(title, fields, records, options, appId, id)
      );
      $('#kintone_portal_'+id+' select.status').change(function(e){
        $e = $(e.target);
        var val = $e.val();
        var appId = parseInt($e.attr('data-app-id'));
        var id = parseInt($e.attr('data-id'));
        var url = kintone.api.url('/k/v1/record', true);
        var params = {
          app: appId,
          id: id,
          record: {
            status: {value: val}
          }
        }
        kintone.api(url, 'PUT', params, function(resp){
          console.log('updated!.');
        });
      });
    });
  });
}

function renderTable(title, fields, records, options, appId, id) {
  var html = ''
  html +='<h2>'+title+'</h2><table id="kintone_portal_'+id+'" cilass=""class="recordlist-gaia" style="margin:0 20px 30px 20px;">';
  for(var i = 0; i < records.length; i++) {
    var record = records[i];
    if(record['appId']){
      var name = record['name'];
      var appId = record['appId'];
      var col = 10;
      if(i%col==0){
        html += '<tr class="recordlist-row-gaia">';
      }
      html += '<td class="recordlist-cell-gaia recordlist-single_line_text-gaia"><a href="/k/'+appId+'" target="_blank">'+name+'</a>[<a href="/k/admin/app/flow?app='+appId+'" target="_blank">設定</a>]</td>';
      if(i%col==col-1){
        html += '</tr>';
      }
    } else {
      var id = record['$id']['value'];
      html += '<tr class="recordlist-row-gaia">';
      html += '<td><a href="https://ruffnote.cybozu.com/k/'+appId+'/show#record='+id+'&mode=edit" target="_blank">'+id+'</a></td>';
      for(var i2 = 0; i2 < fields.length; i2++) {
        var key = fields[i2];
        var val = '';

        if(key.match(/_with_/)){
          var key2 = key.split('_with_');
          var url = record[key2[1]]['value'];
          val = record[key2[0]]['value'];
          val = '<a href="'+url+'" target="_blank">'+val+'</a>';
        } else {
          if(key == 'status') {
            val += '<select class="status" data-app-id="'+appId+'" data-id="'+id+'">';
            for(k in options.status){
              if(k == record[key]['value']){
                val += '<option selected="selected">'+k+'</option>';
              }else{
                val += '<option>'+k+'</option>';
              }
            }
            val += '</select>';
          //} else if('MULTI_LINE_TEXT' == record[key]['type']) {
          //  val = '<textarea styke="width:100%;">'+record[key]['value']+'</textarea>';
          } else {
          //  val = '<input value="'+record[key]['value']+'" style="width: 300px;"/>';
            val = parseHttp(record[key]['value']);
          }
        }
        html += '<td class="recordlist-cell-gaia recordlist-single_line_text-gaia" style="width:180px;">'+val+'</td>';
      }
      html += '</tr>';
    }
  }
  html += '</table>'
  return html
}

parseHttp = function(str) {
  return str.replace(/https?:\/\/[\w?=&.\/-;#~%\-+!]+(?![\w\s?&.\/;#~%"=\-\!]*>)/g, function(http) {
    var text = http;
    if (text.length > 30) {
      text = text.substring(0, 21) + "...";
    }
    return "<a href=\"" + http + "\" target=\"_blank\">" + text + "</a>";
  });
};

