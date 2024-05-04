const submitForm = document.querySelector('#submit');
const updateForm = document.querySelector('#update');
const deleteForm = document.querySelector('#delete');
const result = document.querySelector('.result');

submitForm.addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(submitForm);

  fetch('/api/issues/apitest', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      result.textContent = JSON.stringify(data);
      submitForm.reset();
    });
});

updateForm.addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(updateForm);

  fetch('/api/issues/apitest', {
    method: 'PUT',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      result.textContent = JSON.stringify(data);
      updateForm.reset();
    });
});

deleteForm.addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(deleteForm);

  fetch('/api/issues/apitest', {
    method: 'DELETE',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      result.textContent = JSON.stringify(data);
      deleteForm.reset();
    });
});