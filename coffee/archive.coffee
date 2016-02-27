$ ->
  scenes = [
    'app.record.index.edit.show'
  ]
  kintone.events.on scenes, (event) ->
    $('.recordlist-save-gaia').parent().append("""
    <br/>
    <a href='#'>アーカイブ</a> 
    """)
    

