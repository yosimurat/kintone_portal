$(()->
  kintone.events.on('app.record.index.show', (event)->
    console.log('event')
    $('.box-gaia').html('hoge2')
  )
)

