(function() {
  var init, initIndex, initTable, parseHttp, renderTable;

  initIndex = function(event) {
    var $html, records, url;
    $('.box-gaia').prepend('<div class="kintone_portal"></div>');
    $('.listview-gaia').prepend('<div class="kintone_portal"></div>');
    $html = $('.kintone_portal');
    records = event.records;
    if (records) {
      init(records);
    } else {
      url = kintone.api.url('/k/v1/records', true);
      kintone.api(url, 'GET', {
        app: window.thisAppId
      }, function(resp) {
        init(resp.records);
      });
    }
  };

  init = function(records) {
    var fields;
    var $html, appId, editLink, fields, i, id, query, record, reportId, space, title, url, width;
    $html = $('.kintone_portal');
    i = 0;
    while (i < records.length) {
      record = records[i];
      id = record['$id']['value'];
      appId = record['appId']['value'];
      reportId = record['reportId']['value'];
      query = record['query']['value'];
      title = record['title']['value'];
      fields = record['fields']['value'].split(',');
      space = record['space']['value'];
      width = 600;
      if (reportId) {
        $html.append('<div style="float:left; width:' + width + 'px;"><iframe width="100%" height="600" frameborder="0" src="/k/' + appId + '/report/portlet?report=' + reportId + '"></iframe></div>');
      } else if (space && space.replace(/<div>/, '').replace(/<\/div>/, '').replace(/<br \/>/, '').length) {
        editLink = '<a href="https://ruffnote.cybozu.com/k/' + window.thisAppId + '/show#record=' + id + '&mode=edit">編集</a>';
        $html.append('<div style="float:left; width:' + width + 'px;">' + space + editLink + '</div>');
      } else {
        $html.append('<div id="kintone_portal_table_' + id + '" style="float:left; width:' + width + 'px;">※取得中...</div>');
        initTable(id, fields, {
          app: appId,
          query: query
        }, title);
      }
      i++;
    }
    url = kintone.api.url('/k/v1/apps', true);
    $html.append('<div id="kintone_portal_apps" style="clear:both;"></div>');
    fields = record['fields']['value'].split(',');
    kintone.api(url, 'GET', {}, function(resp) {
      $('#kintone_portal_apps').html(renderTable('アプリ一覧', fields, resp.apps));
    });
  };

  initTable = function(id, fields, params, title) {
    var url;
    url = kintone.api.url('/k/v1/records', true);
    kintone.api(url, 'GET', params, function(resp) {
      var url;
      var appId, options, records;
      records = resp.records;
      url = kintone.api.url('/k/v1/app/form/fields', true);
      options = null;
      appId = params.app;
      kintone.api(url, 'GET', {
        app: params.app
      }, function(resp) {
        if (resp.properties['status']) {
          options = {
            status: resp.properties['status'].options
          };
        }
        $('#kintone_portal_table_' + id).html(renderTable(title, fields, records, options, appId, id));
        $('#kintone_portal_' + id + ' select.status').change(function(e) {
          var params;
          var url;
          var id;
          var appId;
          var $e, val;
          $e = $(e.target);
          val = $e.val();
          appId = parseInt($e.attr('data-app-id'));
          id = parseInt($e.attr('data-id'));
          url = kintone.api.url('/k/v1/record', true);
          params = {
            app: appId,
            id: id,
            record: {
              status: {
                value: val
              }
            }
          };
          kintone.api(url, 'PUT', params, function(resp) {
            console.log('updated!.');
          });
        });
      });
    });
  };

  renderTable = function(title, fields, records, options, appId, id) {
    var id;
    var appId;
    var col, html, i, i2, k, key, key2, name, record, url, val;
    html = '';
    html += '<h2>' + title + '</h2><table id="kintone_portal_' + id + '" cilass=""class="recordlist-gaia" style="margin:0 20px 30px 20px;">';
    i = 0;
    while (i < records.length) {
      record = records[i];
      if (record['appId']) {
        name = record['name'];
        appId = record['appId'];
        col = 10;
        if (i % col === 0) {
          html += '<tr class="recordlist-row-gaia">';
        }
        html += '<td class="recordlist-cell-gaia recordlist-single_line_text-gaia"><a href="/k/' + appId + '" target="_blank">' + name + '</a>[<a href="/k/admin/app/flow?app=' + appId + '" target="_blank">設定</a>]</td>';
        if (i % col === col - 1) {
          html += '</tr>';
        }
      } else {
        id = record['$id']['value'];
        html += '<tr class="recordlist-row-gaia">';
        html += '<td><a href="https://ruffnote.cybozu.com/k/' + appId + '/show#record=' + id + '&mode=edit" target="_blank">' + id + '</a></td>';
        i2 = 0;
        while (i2 < fields.length) {
          key = fields[i2];
          val = '';
          if (key.match(/_with_/)) {
            key2 = key.split('_with_');
            url = record[key2[1]]['value'];
            val = record[key2[0]]['value'];
            val = '<a href="' + url + '" target="_blank">' + val + '</a>';
          } else {
            if (key === 'status') {
              val += '<select class="status" data-app-id="' + appId + '" data-id="' + id + '">';
              for (k in options.status) {
                k = k;
                if (k === record[key]['value']) {
                  val += '<option selected="selected">' + k + '</option>';
                } else {
                  val += '<option>' + k + '</option>';
                }
              }
              val += '</select>';
            } else {
              val = parseHttp(record[key]['value']);
            }
          }
          html += '<td class="recordlist-cell-gaia recordlist-single_line_text-gaia" style="width:180px;">' + val + '</td>';
          i2++;
        }
        html += '</tr>';
      }
      i++;
    }
    html += '</table>';
    return html;
  };

  (function() {
    'use strict';
    var scenes;
    window.thisAppId = kintone.app.getId();
    scenes = ['mobile.app.record.index.show', 'app.record.index.show'];
    kintone.events.on(scenes, function(event) {
      initIndex(event);
    });
  })();

  parseHttp = function(str) {
    return str.replace(/https?:\/\/[\w?=&.\/-;#~%\-+!]+(?![\w\s?&.\/;#~%"=\-\!]*>)/g, function(http) {
      var text;
      text = http;
      if (text.length > 30) {
        text = text.substring(0, 21) + '...';
      }
      return '<a href="' + http + '" target="_blank">' + text + '</a>';
    });
  };

}).call(this);
