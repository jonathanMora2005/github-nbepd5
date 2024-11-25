import { assign, setup } from 'xstate';

export const feedbackMachine = setup({
  types: {
    context: {} as { feedback: string },
    events: {} as
      | { type: 'feedback.good' }
      | { type: 'feedback.bad' }
      | { type: 'feedback.update'; value: string }
      | { type: 'submit' }
      | { type: 'close' }
      | { type: 'back' }
      | { type: 'restart' }
      | { type: 'start.data' } // Añadir evento 'start.data'
      | { type: 'start.validation' }
      | { type: 'start.total' }
      | { type: 'start.receipt' }
      | { type: 'send.invoice' }
      | { type: 'invoice.done' },
  },
  guards: {
    feedbackValid: ({ context }) => context.feedback.length > 0,
  },
}).createMachine({
  id: 'feedback',
  initial: 'idle', // El estado inicial ahora es 'idle'
  context: {
    feedback: '',
  },
  states: {
    idle: {
      on: {
        'start.data': 'awaitingUserData', // 'start.data' mueve a 'awaitingUserData'
      },
    },
    awaitingUserData: {
      on: {
        'start.validation': 'awaitingDataValidation',
      },
    },
    awaitingDataValidation: {
      on: {
        'start.total': 'awaitingTotalResult',
        'start.data': 'awaitingUserData', // 'start.data' mueve a 'awaitingUserData'
      },
    },
    awaitingTotalResult: {
      on: {
        'start.receipt': 'awaitingReceipt',
      },
    },
    awaitingReceipt: {
      on: {
        'send.invoice': 'sendingInvoice',
        'invoice.done': 'invoiceDone',
      },
    },
    sendingInvoice: {
      on: {
        'invoice.done': 'invoiceDone',
      },
    },
    invoiceDone: {
      type: 'final',
    },
    prompt: {
      on: {
        'feedback.good': 'thanks',
        'feedback.bad': 'form',
      },
    },
    form: {
      on: {
        'feedback.update': {
          actions: assign({
            feedback: ({ event }) => event.value,
          }),
        },
        back: { target: 'prompt' },
        submit: {
          guard: 'feedbackValid',
          target: 'thanks',
        },
      },
    },
    thanks: {},
    closed: {
      on: {
        restart: {
          target: 'prompt',
          actions: assign({
            feedback: '',
          }),
        },
      },
    },
  },
  on: {
    close: '.closed',
  },
});
