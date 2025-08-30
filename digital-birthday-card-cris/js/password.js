// HTML modal-based password gate (no window.prompt).

window.addEventListener('DOMContentLoaded', () => {
  const correctPassword = 'bebica';

  const els = {
    modal: document.getElementById('password-modal'),
    form: document.getElementById('password-form'),
    input: document.getElementById('password-input'),
    toggle: document.getElementById('toggle-visibility'),
    error: document.getElementById('password-error'),
    card: document.getElementById('card'),
    dialog: document.querySelector('#password-modal .modal__dialog'),
  };

  function showModal(){
    els.modal.classList.add('shown');
    els.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(()=> els.input?.focus(), 50);
  }
  function hideModal(){
    els.modal.classList.remove('shown');
    els.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function showCard(){
    els.card.classList.remove('hidden');
    // trigger reveal animation
    els.card.classList.add('reveal');
    document.dispatchEvent(new CustomEvent('card:unlocked'));
  }
  function indicateError(msg){
    els.error.textContent = msg || 'Parola este incorectă.';
    els.dialog?.classList.remove('shake'); void els.dialog?.offsetWidth; els.dialog?.classList.add('shake');
  }

  // Toggle password visibility
  els.toggle?.addEventListener('click', ()=>{
    const isPw = els.input.type === 'password';
    els.input.type = isPw ? 'text' : 'password';
    els.input.focus();
  });

  // Submit handler
  els.form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    els.error.textContent = '';
    const pw = (els.input.value || '').trim();
    if(!pw) return indicateError('Te rog introdu parola.');

    if(pw === correctPassword){
      sessionStorage.setItem('cardUnlocked', '1');
      hideModal();
      showCard();
    }else{
      indicateError('Parola este incorectă.');
    }
  });

  // Allow ESC to refocus input
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && els.modal.classList.contains('shown')){
      els.input.focus();
    }
  });

  // Auto-unlock for current session
  if(sessionStorage.getItem('cardUnlocked') === '1'){
    els.modal.classList.remove('shown');
    els.modal.setAttribute('aria-hidden', 'true');
    els.card.classList.remove('hidden');
    els.card.classList.add('reveal');
    document.dispatchEvent(new CustomEvent('card:unlocked'));
  }else{
    showModal();
  }
});