const destinationCurrency={AE:'AED',TR:'TRY',SG:'SGD',GB:'GBP'};
const demoFx={AED:4.15,TRY:47.2,SGD:1.49,GBP:.86};
const demoProviders=[
  {name:'Wise',type:'Fiat transfer',feeRate:.006,eta:'1 business day',badge:'BEST VALUE'},
  {name:'Airwallex',type:'Business fintech',feeRate:.008,eta:'Same day',badge:'FAST'},
  {name:'CoinGate',type:'Stablecoin route',feeRate:.01,eta:'Minutes',badge:'STABLECOIN'}
];

const form=document.getElementById('compareForm');
const results=document.getElementById('results');
const cards=document.getElementById('resultCards');
const route=document.getElementById('routeSummary');
const toCountry=document.getElementById('toCountry');
const currency=document.getElementById('currency');

function track(eventName,data={}){
  const events=JSON.parse(localStorage.getItem('paybridge_beta_events')||'[]');
  events.push({event:eventName,at:new Date().toISOString(),...data});
  localStorage.setItem('paybridge_beta_events',JSON.stringify(events.slice(-200)));
}

function syncCurrency(){
  const preferred=destinationCurrency[toCountry.value];
  if(preferred){currency.value=preferred;}
}

toCountry.addEventListener('change',syncCurrency);
track('visit',{path:location.pathname});

form.addEventListener('submit',function(e){
  e.preventDefault();
  const amount=Number(document.getElementById('amount').value||0);
  const fromCode=document.getElementById('fromCountry').value;
  const toCode=toCountry.value;
  const from=document.getElementById('fromCountry').selectedOptions[0].text;
  const to=toCountry.selectedOptions[0].text;
  const targetCurrency=currency.value;
  const rate=demoFx[targetCurrency]||1;

  route.textContent=`${from} → ${to} • €${amount.toLocaleString()} → ${targetCurrency}`;
  cards.innerHTML=demoProviders.map((p,i)=>{
    const fee=amount*p.feeRate;
    const recipient=(amount-fee)*rate;
    return `<article class="provider-card ${i===0?'best':''}">
      <div class="card-top"><span class="badge">${p.badge}</span><span class="demo-pill">DEMO</span></div>
      <div class="provider-name">${p.name}</div>
      <div class="provider-type">${p.type}</div>
      <div class="metrics">
        <div class="metric"><span>Estimated cost</span><strong>€${fee.toFixed(0)}</strong></div>
        <div class="metric"><span>Recipient gets</span><strong>${recipient.toLocaleString(undefined,{maximumFractionDigits:0})} ${targetCurrency}</strong></div>
        <div class="metric"><span>ETA</span><strong>${p.eta}</strong></div>
        <div class="metric"><span>Source</span><strong>Demo model</strong></div>
      </div>
      <button class="secondary-button" type="button" data-provider="${p.name}">CONTINUE</button>
    </article>`;
  }).join('');

  results.hidden=false;
  results.scrollIntoView({behavior:'smooth',block:'start'});
  track('compare',{from:fromCode,to:toCode,amount,currency:targetCurrency});
  localStorage.setItem('paybridge_last_comparison',JSON.stringify({from,to,amount,currency:targetCurrency,at:new Date().toISOString()}));

  document.querySelectorAll('[data-provider]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const provider=btn.dataset.provider;
      track('provider_click',{provider,from:fromCode,to:toCode,amount,currency:targetCurrency});
      localStorage.setItem('paybridge_last_provider',provider);
      alert(`${provider} selected. PAYBRIDGE Beta is measuring intent only; no payment is initiated.`);
    });
  });
});
