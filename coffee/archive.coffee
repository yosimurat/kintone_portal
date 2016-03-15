$ ->
  kintone.events.on('app.record.index.show', (event) ->
    if !event.records[0]['archive_do']

    else if

  )

  kintone.events.on('app.record.index.edit.change.archive_do', (event) ->
    console.log event.record
    if event.record[window.settings.archive_textarea]['value'].length
      if event.record?
        params = {}
        for key of window.settings.archives
          val = event.record[key]['value']
          type = type = event.record[key]['type']
          archived_key = window.settings.archives[key]
          params[archived_key] = {value: val, type: type}
          if type == 'MULTI_LINE_TEXT'
            event.record[key]['value'] = ''
        event.record[window.settings.archive_table]['value'].push({value: params})
      console.log event.record['archive_do']['value']
      event.record['archive_do']['value'] = []
      alert 'アーカイブ化しました（保存を押すと反映されます）'
    else
      event.record['archive_do']['value'] = []
      #alert '記録を入力した状態でアーカイブボタンを押して下さい'
    return event
  )

