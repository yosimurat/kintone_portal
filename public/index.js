(function () {
  "use strict";
  kintone.events.on('app.record.index.show', function(event){ 
    console.log('event');
    $('.box-gaia').html("<h1>今期売上10億円!</h1>");
    $('.gaia-ui-actionmenu-left').hide();
  });
})();
