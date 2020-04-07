function fetchRawBody(callback) {
  document.querySelector('[aria-label="Message actions"] [aria-label="More email actions"]').click()
  document.querySelector('[aria-label="View message details"]').click()

  const waitForModal = setInterval(function() {
    const modalContent = document.querySelector('.ms-Dialog-content')
    if (modalContent.innerText) {
      let rawEmailBody = modalContent.innerText
      console.log(rawEmailBody)
      document.querySelector('.ms-Dialog-action button').click()
      clearInterval(waitForModal)
      callback(rawEmailBody)
    }
  }, 300)
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === 'FETCH_RAW_BODY') {
      try {
        fetchRawBody((body) => {
          sendResponse({ body })
        })
      } catch (error) {
        console.error(error)
        sendResponse({ error })
      }
      return true
    }
  })
