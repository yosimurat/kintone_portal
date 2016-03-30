$ ->
  
  kintone.events.on('app.record.detail.show', (event) ->
    console.log('detail.show2')
    kintone.api(kintone.api.url('/k/v1/app/views', true), 'GET', {app:kintone.app.getId()}, (resp) -> console.log(resp))

    kintonePreviewAdd = () ->
      fieldsOption = 
        app:kintone.app.getId()
        properties:
          "archive_do":
            type: "CHECK_BOX",
            code: "archive_do",
            label: "アーカイブ",
            noLabel: false,
            required: false,
            options: 
                "する": 
                    label: "する",
                    index: "0"
            defaultValue: [],
            align: "HORIZONTAL"
      console.log('PREVIEW')
      kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'POST', fieldsOption, ((resp) -> kintoneViewAdd()), ((resp) -> kintoneRevert()))
#      kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'POST', fieldsOption, ((resp) -> kintoneDeploy()), ((resp) -> kintoneRevert()))

    kintonePreviewDelete = () ->
      console.log('PREVIEW')
      kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'DELETE', {app:kintone.app.getId(), fields:['archive_do']}, ((resp) -> kintoneDeploy()), ((resp) -> kintoneRevert()))
    
    kintoneViewAdd = () -> 
      console.log('VIEW PREVIEW')
      fields = []
      for key, value of window.settings.archives
        fields.push(key)
      fields.push('archive_do')
      viewName = window.settings.archive_view
      
      fieldsOption = 
        app:kintone.app.getId()
        views: {}
      fieldsOption['views'][viewName] =
            fields: fields
            #fields:["ドロップダウン", "日付", "文字列__複数行_", 'archive_do']
            filterCond: ""
#            id: "5118381"
            index: "0"
            name: viewName
            sort: "レコード番号 desc"
            type: "LIST"

      kintone.api(kintone.api.url('/k/v1/preview/app/views', true), 'PUT', fieldsOption, ((resp) -> kintoneDeploy()), ((resp) -> console.log(resp)))
    
    kintoneDeploy = () -> 
      console.log('DEPLOY')
      kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'POST', {apps: [{app:kintone.app.getId()}]}, (resp) -> confirmReload())
      
    kintoneRevert =  (resp) ->
      console.log('REVERT')
      kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'POST', {apps: [{app:kintone.app.getId()}], "revert": true}, (resp) -> console.log(resp))
      
    confirmReload = () ->
      if confirm("設定反映中です、しばらくたってから画面を開きなおしてください。\n画面を開き直してもよろしいですか？")
        kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'GET', {apps: [kintone.app.getId()]}, (resp) -> 
          status = resp.apps[0].status
          if status == 'PROCESSING'
            setTimeout((() -> confirmReload()), 3000)
          else if status == 'SUCCESS'
            location.reload()
          else
            alert('エラーが発生しました；' + status)
        )

    if !event.record['archive_do']

      if confirm('アーカイブの項目を追加しますか？')
        kintonePreviewAdd()
        
    else
      # kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {app: kintone.app.getId()}, (resp) -> console.log(resp))
      # if confirm('アーカイブの項目を削除しますか？')
      #   kintonePreviewDelete()
  )

  kintone.events.on('app.record.index.show', (event) ->
    console.log('index.show')

    if !event.records[0]['archive_do']
    else
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

