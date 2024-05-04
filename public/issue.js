const submitForm = document.querySelector('#submit');
const issueContainer = document.querySelector('.issue-container');

submitForm.addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(submitForm);

  fetch(`/api/issues/${window.location.pathname.split('/').pop()}`, {
    method: 'POST',
    body: formData
  })
    .then(() => window.location.reload());
});

fetch(`/api/issues/${window.location.pathname.split('/').pop()}`)
  .then(res => res.json())
  .then(data => {
    issueContainer.append(...data.map(issue => {
      const issueDiv = document.createElement('div');
      issueDiv.classList.add('issue');

      if (!issue.open) {
        issueDiv.classList.add('closed');
      }

      const id = document.createElement('p');
      id.classList.add('id');
      id.textContent = `id: ${issue._id}`;

      const title = document.createElement('h3');
      title.textContent = `${issue.issue_title} - (${issue.open ? 'open' : 'closed'})`;

      const text = document.createElement('p');
      text.classList.add('text');
      text.textContent = issue.issue_text;

      const status = document.createElement('p');
      status.classList.add('status');
      status.textContent = issue.status_text ?? '';

      const createdBy = document.createElement('p');
      createdBy.innerHTML = `<b>Created by: </b>${issue.created_by}`;

      const assignedTo = document.createElement('p');
      assignedTo.innerHTML = `<b>Assigned to: </b>${issue.assigned_to ?? '-'}`;

      const createdOn = document.createElement('p');
      createdOn.innerHTML = `<b>Created on: </b>${issue.created_on}`;

      const lastUpdated = document.createElement('p');
      lastUpdated.innerHTML = `<b>Last updated: </b>${issue.updated_on ?? '-'}`;

      const actions = document.createElement('div');
      actions.classList.add('issue-actions');

      const btns = [];

      actions.append(
        ...['close', 'delete'].map(action => {
          if (!issue.open && action === 'close') return;

          const btn = document.createElement('button');
          btn.classList.add(`${action}-issue`);
          btn.textContent = action.charAt(0).toUpperCase() + action.slice(1);
          
          return btn;
        }).filter(Boolean));

      issueDiv.append(
        id,
        title,
        text,
        status,
        createdBy,
        assignedTo,
        createdOn,
        lastUpdated,
        actions
      );

      return issueDiv;
    }));

    const closeBtns = document.querySelectorAll('.close-issue');
    const deleteBtns = document.querySelectorAll('.delete-issue');

    closeBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        const formData = new FormData();
        formData.append("_id", e.target.closest('.issue').querySelector('.id').textContent.split(':').pop().trim());
        formData.append("open", "false");

        fetch(`/api/issues/${window.location.pathname.split('/').pop()}`, {
          method: 'PUT',
          body: formData
        })
          .then(() => window.location.reload());
      });
    });

    deleteBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        const formData = new FormData();
        formData.append("_id", e.target.closest('.issue').querySelector('.id').textContent.split(':').pop().trim());

        fetch(`/api/issues/${window.location.pathname.split('/').pop()}`, {
          method: 'DELETE',
          body: formData
        })
          .then(() => window.location.reload());
      });
    });
  });


