(function () {
  "use strict";
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
  if(records){
    init(records);
  } else {
    var url = kintone.api.url('/k/v1/records', true);
    var appId = kintone.app.getId();
    kintone.api(url, 'GET', {app: appId}, function(resp) {
      init(resp.records);
    });
  }
}

function init(records) {
  var $html = $('.kintone_portal');
  for(var i = 0; i < records.length; i++) {
    var record = records[i]
    var id  = record['$id']['value']
    var appId  = record['appId']['value']
    var reportId  = record['reportId']['value']
    var query  = record['query']['value']
    var title = record['title']['value']
    var fields = record['fields']['value'].split(',');
    var space  = record['space']['value']
    if(reportId){
      $html.append('<iframe width="800" height="600" frameborder="0" src="/k/'+appId+'/report/portlet?report='+reportId+'"></iframe>');
    } else if(space){
      $html.append('<h1>'+space+'</h1>');
    } else {
      $html.append('<div id="kintone_portal_table_'+id+'">※取得中...</div>');
      initTable(id, fields, {app: appId, query: query}, title);
    }
  }
  var url = kintone.api.url('/k/v1/apps', true);
  $html.append('<div id="kintone_portal_apps"></div>');
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
        console.log(e);
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
  html += '<div style="width:800px; float:left; margin:17px;">'
  html +='<h2>'+title+'</h2><table id="kintone_portal_'+id+'" cilass=""class="recordlist-gaia" style="table-layout: fixed; position: relative; margin-bottom:30px;">';
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
      html += '<tr class="recordlist-row-gaia">';
      var id = record['$id']['value'];
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
  html += '</div>'
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



