(function () {
  "use strict";
  kintone.events.on('app.record.index.show', function(event){ 
    console.log('index is showed');
    $('.box-gaia').prepend('<div id="nc"></div>');
    $('.box-gaia').prepend('<div id="kintone_portal"></div>');
    var $html = $('#kintone_portal');
    $html.html("<h1>今期売上10億円!</h1>");

    var records = event.records;
    for(var i = 0; i < records.length; i++) {
      var record = records[i]
      var id  = record['$id']['value']
      var appId  = record['appId']['value']
      var reportId  = record['reportId']['value']
      var query  = record['query']['value']
      var title = record['title']['value']
      if(reportId){
        $html.append('<iframe width="800" height="600" frameborder="0" src="/k/'+appId+'/report/portlet?report='+reportId+'"></iframe>');
      } else {
        $html.append('<div id="kintone_portal_table_'+id+'">※取得中...</div>');
        initTable(id, {app: appId, query: query}, title);
      }
    }
    var url = kintone.api.url('/k/v1/apps', true);
    $html.append('<div id="kintone_portal_apps"></div>');
    kintone.api(url, 'GET', {}, function(resp) {
      $("#kintone_portal_apps").html(renderTable('アプリ一覧', resp.apps));
    });
  });
})();

function initTable(id, params, title) {
  var url = kintone.api.url('/k/v1/records', true);
  kintone.api(url, 'GET', params, function(resp) {
    $("#kintone_portal_table_"+id).html(renderTable(title, resp.records));
  });
}

function renderTable(title, records) {
  var html = '<h2>'+title+'</h2><table class="recordlist-gaia" style="table-layout: fixed; position: relative; margin-bottom:30px;">'
  for(var i = 0; i < records.length; i++) {
    var record = records[i];
    if(record['title']){
      var title = record['title']['value'];
      var url = record['html_url']['value'];
      var title_with_link = '<a href="'+url+'" target="_blank">'+title+'</a>'
      var body = record['body']['value'];
      html += '<tr class="recordlist-row-gaia"><td class="recordlist-cell-gaia recordlist-single_line_text-gaia" style="width: 300px;">'+title_with_link+'</td><td>'+body+'</td></tr>';
    } else if(record['Company']){
      var company = record['Company']['value'];
      var s = record['status']['value'];
      html += '<tr class="recordlist-row-gaia"><td class="recordlist-cell-gaia recordlist-single_line_text-gaia" style="width: 300px;">'+company+'</td><td>'+s+'</td></tr>';
    } else {
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
    }
  }
  html += '</table>'
  return html
}


