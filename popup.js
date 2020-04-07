const DATA_HUB_MAIL_PARSER_ENDPOINT = 'http://localhost:8008/v3/interaction/mail'
const DATA_HUB_STUB_INTERACTION_FORM_URL = 'http://localhost:3001/interactions/create-stub'

function setStatus(statusText, details='') {
  document.getElementById('status-message').innerText = statusText
  document.getElementById('status-details').innerText = details
}

function handleError(e) {
  setStatus("Couldn't fetch interaction from the opened email.", JSON.stringify(e))
}

function getUrlToStubInteractionForm(stubInteraction) {
  const params = [
    stubInteraction.company_id && `company_id=${stubInteraction.company}`,
    stubInteraction.subject && `subject=${stubInteraction.subject}`,
    stubInteraction.date && `date=${stubInteraction.date}`,
    ...stubInteraction.contacts ? stubInteraction.contacts.map(c => `contact_id=${c}`) : [],
    ...stubInteraction.dit_participants ? stubInteraction.dit_participants.map(a => `adviser_id=${a}`) : [],
  ].filter(p => p).join('&')

  return new URL(
    '?' + params,
    DATA_HUB_STUB_INTERACTION_FORM_URL)
    .href
}

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    setStatus('Fetching interaction details...')

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'FETCH_RAW_BODY' }, function handler({ body, error }) {
        if (body && !error) {
          fetch(DATA_HUB_MAIL_PARSER_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
              message: body,
            })
          })
            .then(response => response.json())
            .then(responseBody => {
              const formUrl = getUrlToStubInteractionForm(responseBody)

              if (!responseBody.company) {
                throw responseBody
              }

              setStatus(
                'Clicking the "Add interaction" button below will redirect you to Data Hub where you will able to create a new interaction based on the email.',
                JSON.stringify(responseBody)
              )

              document.querySelector('#create').href = formUrl
            })
            .catch(handleError)
        } else {
          handleError(error)
        }
      })
    })
  })
})()
