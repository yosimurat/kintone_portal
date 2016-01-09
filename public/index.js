(function () {
  "use strict";
  kintone.events.on('app.record.index.show', function(event){ 
    console.log('index is showed');
    //$('.title-gaia').hide();
    //$('.gaia-ui-actionmenu').hide();
    //$('.menu-gaia').hide();
    //$('.gaia-ui-listtable-bottommenu').hide();
    
    var records = event.records;
    console.log(event);
    for(var i = 0; i < records.length; i++) {
      var record = records[i]
      var appId  = record['appId']['value']
      var reportId  = record['reportId']['value']
      $('.box-gaia').prepend('<iframe width="800" height="600" frameborder="0" src="/k/'+appId+'/report/portlet?report='+reportId+'"></iframe>');
    }
    $('.box-gaia').prepend("<h1>今期売上10億円!</h1>");
  });
})();
