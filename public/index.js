function renderTable(records) {
  html = '<table class="recordlist-gaia" style="table-layout: fixed; position: relative; margin-bottom:30px;">'
  for(var i = 0; i < records.length; i++) {
    var record = records[i];
    if(record['title']){
      var title = record['title']['value'];
      var url = record['html_url']['value'];
      var title_with_link = '<a href="'+url+'" target="_blank">'+title+'</a>'
      var body = record['body']['value'];
      html += '<tr class="recordlist-row-gaia"><td class="recordlist-cell-gaia recordlist-single_line_text-gaia" style="width: 300px;">'+title_with_link+'</td><td>'+body+'</td></tr>';
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

(function () {
  "use strict";
  kintone.events.on('app.record.index.show', function(event){ 
    console.log('index is showed');
    var html = "<h1>今期売上10億円!</h1>"

    kintone.api(kintone.api.url('/k/v1/apps', true), 'GET', {}, function(resp) {
      html += renderTable(resp.apps);
    });

    var appId = 138;
    var query = kintone.app.getQueryCondition() + 'repository_full_name = "pandeiro245/kintone_sync" and state != "closed"';
    kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {app: appId, query: query}, function(resp) {
      html += renderTable(resp.records);

      var records = event.records;
      for(var i = 0; i < records.length; i++) {
        var record = records[i]
        var appId  = record['appId']['value']
        var reportId  = record['reportId']['value']
        html += '<iframe width="800" height="600" frameborder="0" src="/k/'+appId+'/report/portlet?report='+reportId+'"></iframe>';
      }

      $('.box-gaia').prepend(html);
    });
  });
})();
