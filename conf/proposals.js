'use strict';

var proposals = [
  {
    title: 'UIP #1 - Independent Proof-of-Work algorithm',
    proposal: 'proposal',
    type: 'UIP',
    contract: '0xfcd0b547b89f001c17d50df98cf10ce406da5518',
    data: '/ubiq/UIPs/issues/1',
    uip: '/ubiq/UIPs/master/UIPs/uip-1.md',
    candidates: [
      {
        title: 'Yes',
        index: 1,
        totalWeight: '0',
        totalVotes: 0
      },
      {
        title: 'No',
        index: 2,
        totalWeight: '0',
        totalVotes: 0
      },
      {
        title: 'Abstain',
        index: 3,
        totalWeight: '0',
        totalVotes: 0
      }
    ]
  },
  {
    title: 'UIP #2 - Simplify the Network Development Fund',
    proposal: 'proposal',
    type: 'UIP',
    contract: '0x96cf38c234d5e513c4fc783a3ba73d7320f2900b',
    data: '/ubiq/UIPs/issues/2',
    uip: '/ubiq/UIPs/master/UIPs/uip-2.md',
    candidates: [
      {
        title: 'Sell all forks of BTC for BTC',
        index: 1,
        totalWeight: '0',
        totalVotes: 0
      },
      {
        title: 'Sell all forks of BTC for ETH',
        index: 2,
        totalWeight: '0',
        totalVotes: 0
      },
      {
        title: 'Sell all forks of BTC for UBQ',
        index: 3,
        totalWeight: '0',
        totalVotes: 0
      },
      {
        title: 'Retain all forks of BTC',
        index: 4,
        totalWeight: '0',
        totalVotes: 0
      },
      {
        title: 'Abstain',
        index: 5,
        totalWeight: '0',
        totalVotes: 0
      }
    ]
  }
];


module.exports = {
  data: proposals
}
