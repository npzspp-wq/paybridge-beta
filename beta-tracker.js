(function () {
  var KEY = 'pb_beta';
  var ENDPOINT = 'https://paybridge-analytics.npzspp.workers.dev/event';

  function saveLocal(type, data) {
    try {
      var rows = JSON.parse(localStorage.getItem(KEY) || '[]');
      rows.push({
        type: type,
        time: new Date().toISOString(),
        data: data || {}
      });
      localStorage.setItem(KEY, JSON.stringify(rows.slice(-200)));
      return true;
    } catch (e) {
      return false;
    }
  }

  async function sendAggregate(type, data) {
    var d = data || {};

    var from = String(d.from || '').slice(0, 20);
    var to = String(d.to || '').slice(0, 20);
    var provider = String(d.provider || '').slice(0, 50);

    var source = [
      from && to ? from + ' -> ' + to : '',
      provider
    ].filter(Boolean).join(' | ');

    var payload = {
      type: String(type || '').slice(0, 50),
      source: source || 'paybridge-beta',
      amount:
        d.amount === undefined || d.amount === null
          ? null
          : Number(d.amount),
      currency: String(d.currency || '').slice(0, 10)
    };

    try {
      var response = await fetch(ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: true
      });

      if (!response.ok) {
        console.warn(
          'PAYBRIDGE analytics rejected:',
          response.status
        );
      }
    } catch (e) {
      console.warn('PAYBRIDGE analytics failed:', e);
    }
  }

  window.PaybridgeBeta = {
    save: function (type, data) {
      var ok = saveLocal(type, data);

      if (type === 'compare' || type === 'route') {
        sendAggregate(type, data);
      }

      return ok;
    },

    summary: function () {
      try {
        var rows = JSON.parse(
          localStorage.getItem(KEY) || '[]'
        );

        return {
          comparisons: rows.filter(function (x) {
            return x.type === 'compare';
          }).length,

          routes: rows.filter(function (x) {
            return x.type === 'route';
          }).length
        };
      } catch (e) {
        return {
          comparisons: 0,
          routes: 0
        };
      }
    }
  };
})();
