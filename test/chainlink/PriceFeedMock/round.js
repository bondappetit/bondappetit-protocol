const {contract, assert} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("PriceFeedMock.round", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const version = "1";
  const decimals = "8";
  let instance;
  const rounds = [
    {
      roundId: "1",
      answer: "1",
      startedAt: "1",
      updatedAt: "1",
      answeredInRound: "1",
    },
    {
      roundId: "2",
      answer: "2",
      startedAt: "2",
      updatedAt: "2",
      answeredInRound: "2",
    },
  ];

  before(async () => {
    instance = await artifacts.deploy("PriceFeedMock", [decimals, version], {
      from: governor,
      gas: 6000000,
    });
  });

  it("version: should return preset version", async () => {
    assert.equal(
      await instance.methods.version().call(),
      version,
      "Invalid version"
    );
  });

  it("decimals: should return preset decimals", async () => {
    assert.equal(
      await instance.methods.decimals().call(),
      decimals,
      "Invalid decimals"
    );
  });

  it("getRoundData: should return data of round", async () => {
    const roundIn = rounds[0];
    await instance.methods
      .addRound(
        roundIn.roundId,
        roundIn.answer,
        roundIn.startedAt,
        roundIn.updatedAt,
        roundIn.answeredInRound
      )
      .send({from: governor, gas: 6000000});
    const roundOut = await instance.methods
      .getRoundData(roundIn.roundId)
      .call();

    assert.equal(roundOut.roundId, roundIn.roundId, "Invalid round id");
    assert.equal(roundOut.answer, roundIn.answer, "Invalid round answer");
    assert.equal(
      roundOut.startedAt,
      roundIn.startedAt,
      "Invalid round started at"
    );
    assert.equal(
      roundOut.updatedAt,
      roundIn.updatedAt,
      "Invalid round updated at"
    );
    assert.equal(
      roundOut.answeredInRound,
      roundIn.answeredInRound,
      "Invalid answered in round"
    );
  });

  it("latestRoundData: should return data of latest round", async () => {
    const latestRoundIn = rounds[1];
    await instance.methods
      .addRound(
        latestRoundIn.roundId,
        latestRoundIn.answer,
        latestRoundIn.startedAt,
        latestRoundIn.updatedAt,
        latestRoundIn.answeredInRound
      )
      .send({from: governor, gas: 6000000});
    const latestRoundOut = await instance.methods.latestRoundData().call();

    assert.equal(
      latestRoundOut.roundId,
      latestRoundIn.roundId,
      "Invalid round id"
    );
    assert.equal(
      latestRoundOut.answer,
      latestRoundIn.answer,
      "Invalid round answer"
    );
    assert.equal(
      latestRoundOut.startedAt,
      latestRoundIn.startedAt,
      "Invalid round started at"
    );
    assert.equal(
      latestRoundOut.updatedAt,
      latestRoundIn.updatedAt,
      "Invalid round updated at"
    );
    assert.equal(
      latestRoundOut.answeredInRound,
      latestRoundIn.answeredInRound,
      "Invalid answered in round"
    );
  });
});