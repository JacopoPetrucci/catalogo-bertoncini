document.addEventListener('DOMContentLoaded', function () {
  var ACCESS_CODE = 'phd_consaq';
  var STORAGE_KEY = 'bertoncini-access';

  var gate = document.getElementById('access-gate');
  if (!gate) return;

  var unlocked = false;
  try {
    unlocked = sessionStorage.getItem(STORAGE_KEY) === 'ok';
  } catch (e) {}

  if (unlocked) return;

  var form = gate.querySelector('.access-gate-form');
  var input = document.getElementById('access-gate-input');
  var error = document.getElementById('access-gate-error');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value === ACCESS_CODE) {
      try { sessionStorage.setItem(STORAGE_KEY, 'ok'); } catch (e) {}
      document.documentElement.classList.remove('gate-locked');
    } else {
      error.classList.add('show');
      input.value = '';
      input.focus();
    }
  });
});
