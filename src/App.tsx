import './App.css';
import { feedbackMachine } from './feedbackMachine';
import { useMachine } from '@xstate/react';
import { createBrowserInspector } from '@statelyai/inspect';

const { inspect } = createBrowserInspector({
  // Comment out the line below to start the inspector
  autoStart: false,
});

function Feedback() {
  const [state, send] = useMachine(feedbackMachine, {
    inspect,
  });

  if (state.matches('closed')) {
    return (
      <div>
        <em>Feedback form closed.</em>
        <br />
        <button
          onClick={() => {
            send({ type: 'restart' });
          }}
        >
          Provide more feedback
        </button>
      </div>
    );
  }

  return (
    <>
    {state.value}
    <div className="feedback">
      {/* Botón para iniciar la máquina de estados */}
      {!state.matches('awaitingUserData') &&
        !state.matches('awaitingDataValidation') &&
        !state.matches('awaitingTotalResult') &&
        !state.matches('awaitingReceipt') &&
        !state.matches('sendingInvoice') &&
        !state.matches('invoiceDone') && (
          <button
            className="button"
            onClick={() => send({ type: 'start.data' })}
          >
            Start Process
          </button>
        )}

      <button
        className="close-button"
        onClick={() => {
          send({ type: 'close' });
        }}
      >
        Close
      </button>

      {/* Estats nous implementats aquí */}

      {state.matches('awaitingUserData') && (
        <div className="step">
          <h2>Esperant dades de l'usuari</h2>
          <p>Please enter your data.</p>
          <button
            className="button"
            onClick={() => send({ type: 'start.validation' })}
          >
            Next
          </button>
        </div>
      )}

      {state.matches('awaitingDataValidation') && (
        <div className="step">
          <h2>Esperant la comprovació de dades</h2>
          <p>Verifying your data...</p>
          <button
            className="button"
            onClick={() => send({ type: 'start.total' })}
          >
            Next
          </button>
          <button
            className="button"
            onClick={() => send({ type: 'start.data' })}
          >
            Incorectas
          </button>
        </div>
      )}

      {state.matches('awaitingTotalResult') && (
        <div className="step">
          <h2>Esperant el resultat del total</h2>
          <p>Calculating the total result...</p>
          <button
            className="button"
            onClick={() => send({ type: 'start.receipt' })}
          >
            Next
          </button>
        </div>
      )}

      {state.matches('awaitingReceipt') && (
        <div className="step">
          <h2>Esperant si vol rebut</h2>
          <button
            className="button"
            onClick={() => send({ type: 'send.invoice' })}
          >
            Si
          </button>
          <button
            className="button"
            onClick={() => send({ type: 'invoice.done' })}
          >
            No
          </button>
        </div>
      )}

      {state.matches('sendingInvoice') && (
        <div className="step">
          <h2>Enviant la factura...</h2>
          <button
            className="button"
            onClick={() => send({ type: 'invoice.done' })}
          >
            Done
          </button>
        </div>
      )}

      {state.matches('invoiceDone') && (
        <div className="step">
          <h2>Factura acabada</h2>
          <p>Your invoice has been sent successfully.</p>
        </div>
      )}

      {/* Altres estats existents */}
      {state.matches('prompt') && (
        <div className="step">
          <h2>How was your experience?</h2>
          <button
            className="button"
            onClick={() => send({ type: 'feedback.good' })}
          >
            Good
          </button>
          <button
            className="button"
            onClick={() => send({ type: 'feedback.bad' })}
          >
            Bad
          </button>
        </div>
      )}

      {state.matches('thanks') && (
        <div className="step">
          <h2>Thanks for your feedback.</h2>
          {state.context.feedback.length > 0 && (
            <p>"{state.context.feedback}"</p>
          )}
        </div>
      )}

      {state.matches('form') && (
        <form
          className="step"
          onSubmit={(ev) => {
            ev.preventDefault();
            send({
              type: 'submit',
            });
          }}
        >
          <h2>What can we do better?</h2>
          <textarea
            name="feedback"
            rows={4}
            placeholder="So many things..."
            onChange={(ev) => {
              send({
                type: 'feedback.update',
                value: ev.target.value,
              });
            }}
          />
          <button className="button" disabled={!state.can({ type: 'submit' })}>
            Submit
          </button>
          <button
            className="button"
            type="button"
            onClick={() => {
              send({ type: 'back' });
            }}
          >
            Back
          </button>
        </form>
      )}
    </div></>
  );
}

function App() {
  return <Feedback />;
}

export default App;
