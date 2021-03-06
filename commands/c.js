const { MessageEmbed } = require("discord.js");
const got = require("got");

module.exports = {
  category: "Crypto",
  description: "Checks price of a coin",

  // testOnly: true,

  callback: ({ message }) => {
    const currencyFotmat = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    });

    let coinID,
      coinSymbol,
      coinName,
      coinPrice,
      coin24h,
      coin7d,
      coinLogo,
      symbolCheck;

    priceRequest(message);

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    async function priceRequest(msg) {
      coinSymbol = msg.content.split(" ")[1];
      coinSymbol = coinSymbol.toUpperCase();

      await getID(coinSymbol);
      await priceRounding();

      let linkName = coinName.replace(/\s/g, "-"); // Replaces any spaces in the coins name with - to match the links

      const embed = new MessageEmbed()
        .setColor("#fd2973")
        .setTitle("Cryptocurrency Price Tracker")
        .setDescription(coinName)
        .setURL(`https://www.coingecko.com/en/coins/${coinID}`)
        .setThumbnail(coinLogo)
        .addFields(
          {
            name: "**Price (24h)**",
            value: `${coinPrice} (${
              Math.round((coin24h + Number.EPSILON) * 100) / 100
            }%)`,
          },
          {
            name: "**7 Day Percentage Change**",
            value: `${Math.round((coin7d + Number.EPSILON) * 100) / 100}%`,
          }
        )
        .setTimestamp()
        .setFooter(
          "Made by Roo#7777",
          "https://i.ibb.co/VDMp2Bx/0e58a19b5a24f0542691313ff5106e40-1.png"
        );

      msg.reply({ embeds: [embed] });
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    async function getID(coinSymbol) {
      const headers = {
        accept: "application/json",
      };

      let res;

      try {
        res = await got.get(
          `https://api.coingecko.com/api/v3/search?query=${coinSymbol}`,
          {
            headers,
            responseType: "json",
          }
        );
      } catch (e) {
        console.error(e.toString());
      }
      coinID = res.body.coins[0].id;

      symbolCheck = res.body.coins[0].symbol;
      if (coinSymbol != symbolCheck) coinID = res.body.coins[1].id;

      await getPrice(coinID);
    }

    async function getPrice(coinID) {
      const headers = {
        accept: "application/json",
      };

      let res;

      try {
        res = await got.get(
          `https://api.coingecko.com/api/v3/coins/${coinID}?localization=false&tickers=false`,
          {
            headers,
            responseType: "json",
          }
        );
      } catch (e) {
        console.error(e.toString());
      }

      coinName = res.body.name;
      coinPrice = res.body.market_data.current_price.gbp;
      coin24h =
        res.body.market_data.price_change_percentage_24h_in_currency.gbp;
      coin7d = res.body.market_data.price_change_percentage_7d_in_currency.gbp;
      coinLogo = res.body.image.large;
    }

    async function priceRounding() {
      if (coinPrice < 10 && coinPrice > 1) {
        coinPrice = `??${parseFloat(coinPrice.toFixed(3))}`;
      } else if (coinPrice < 1 && coinPrice > 0.1) {
        coinPrice = `??${parseFloat(coinPrice.toFixed(4))}`;
      } else if (coinPrice < 0.1 && coinPrice > 0.001) {
        coinPrice = `??${parseFloat(coinPrice.toFixed(5))}`;
      } else if (coinPrice < 0.001) {
        coinPrice = `??${parseFloat(coinPrice.toFixed(9))}`;
      } else {
        coinPrice = currencyFotmat.format(coinPrice);
      }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
  },
};
