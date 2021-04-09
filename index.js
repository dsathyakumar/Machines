const {Machine, interpret, assign } = require('xstate');

const lightMachine = Machine({
    strict: true,
    id: 'lightMachine',
    context: {
        isOn: false,
        isBroken: false
    },
    initial: "unlit",
    states: {
        unlit: {
            entry: ["enterunlit"],
            on: {
                LIT: {
                    target: "lit",
                    actions: ["lighting"],
                    internal: false
                },
                STRIKE: {
                    actions: ['logBreaking'],
                    target: "broken",
                    cond: "isBroken",
                    internal: false
                }
            },
            exit: ["exitunlit"]
        },
        lit: {
            entry: ["enterlit"],
            on: {
                UNLIT: {
                    target: "unlit",
                    internal: false
                },
                STRIKE: {
                    actions: ['logBreaking'],
                    target: "broken",
                    cond: "isBroken",
                    internal: false
                }
            },
            exit: ["exitlit"]
        },
        broken: {
            initial: "unknown",
            states: {
                unknown: {
                    entry: ['updatebroken'],
                    always: [
                        {
                            target: "unmendable",
                            cond: "isUnmendable",
                            internal: false
                        },
                        {
                            target: "#lightMachine.unlit",
                            actions: ["canmend"],
                            internal: false
                        }
                    ]
                },
                unmendable: {
                    entry: ["cannotmend"],
                    type: "final"
                }
            }
        }
    }
}, {
    guards: {
        isUnmendable: (ctx, evt, meta) => {
            // we access via meta.state.event cos of this
            // https://github.com/davidkpiano/xstate/issues/890
            console.log('isUnmendable!!!', evt, meta.state.event);
            let cannotBeMended = true;
            if (meta.state.event.watts && meta.state.event.watts > 50) {
                cannotBeMended = false;
            }
            console.warn(`cannotBeMended: ${cannotBeMended}`);
            return cannotBeMended;
        },
        isBroken: (ctx, evt) => {
            console.log('isBroken');
            console.log(evt);
            let hasBroken = false;
            if (evt.material && evt.material === "glass") {
                hasBroken = true;
            }
            console.log(`hasBroken: ${hasBroken}`);
            return hasBroken;
        }
    },
    actions: {
        updatebroken: assign((ctx, evt) => {
            console.log('updating broken state');
            return {
                isOn:false,
                isBroken: true
            }
        }),
        canmend: (ctx, evt) => {
            console.log('Yay! mended');
        },
        cannotmend: (ctx, evt) => console.log('Ooops! cant mend'),
        logBreaking: (ctx, evt) => {
            console.log(`I'm transitioning into breaking`);
        },
        enterlit: assign((ctx, evt) => {
            console.log('Im entering LIT state');
            return {
                isOn: true,
                isBroken: false
            }
        }),
        exitlit: (ctx, evt) => {
            console.log('Im exiting LIT state');
        },
        enterunlit: assign((ctx, evt) => {
            console.log('Im entering UNLIT state');
            return {
                isOn: false,
                isBroken: false
            }
        }),
        exitunlit: (ctx, evt) => {
            console.log('Im exiting UNLIT state');
        },
        lighting: (ctx, evt) => console.log('LIGHTING UPPPPP!!!!!!')
    }
});

const service = interpret(lightMachine)
    .onTransition(state => console.log(`\n stateVal = ${state.value}, \n context=${JSON.stringify(state.context)}`))
    .start();
// console.log(service.initialState);


service.send({type: "LIT"});
// console.log(service.state);

service.send({type: "STRIKE"});
// console.log(`current state value: ${service.state.value}`);
console.log(`------------------------------------------------`);
service.send({type: "STRIKE", material: "glass"});
// service.send({type: "STRIKE", material: "glass", watts: 100});