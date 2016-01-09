(function () {
  "use strict";

  kintone.events.on(['mobile.app.record.index.show', 'app.record.index.show'], function(event){ 
    console.log('index is showed');
    //$('.box-gaia').prepend('<div id="nc"></div>');
    $('.box-gaia').prepend('<div class="kintone_portal"></div>');
    $('.listview-gaia').prepend('<div class="kintone_portal"></div>');
    var $html = $('.kintone_portal');
    $html.html("<h1>今期売上10億円!</h1>");

    var records = event.records;
    if(records){
      init(records);
    } else {
      var url = kintone.api.url('/k/v1/records', true);
      kintone.api(url, 'GET', {app: 139}, function(resp) {
        console.log(resp);
        init(resp.records);
      });
    }
  });
})();

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
    if(reportId){
      $html.append('<iframe width="800" height="600" frameborder="0" src="/k/'+appId+'/report/portlet?report='+reportId+'"></iframe>');
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
    $("#kintone_portal_table_"+id).html(renderTable(title, fields, resp.records));
  });
}

function renderTable(title, fields, records) {
  var html = ''
  html += '<div style="width:800px; float:left; margin:17px;">'
  html +='<h2>'+title+'</h2><table class="recordlist-gaia" style="table-layout: fixed; position: relative; margin-bottom:30px;">';
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
      for(var i2 = 0; i2 < fields.length; i2++) {
        var key = fields[i2];
        var val = ''
        if(key.match(/_with_/)){
          var key2 = key.split('_with_');
          var url = record[key2[1]]['value'];
          val = record[key2[0]]['value'];
          val = '<a href="'+url+'" target="_blank">'+val+'</a>';
        } else {
          val = record[key]['value'];
        }
        html += '<td class="recordlist-cell-gaia recordlist-single_line_text-gaia">'+val+'</td>';
      }
      //html += '</tr>';
    }
  }
  html += '</table>'
  html += '</div>'
  return html
}

