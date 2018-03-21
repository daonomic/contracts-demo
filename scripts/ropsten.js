var token = DemoToken.at("0x21a65ed47cac87fa7cb88ec3ca1469716b6f537e");
token.transferOwnership("0xab574319fa11919f33e31d7eda5afb601a5ff354");

DemoSale.new("0x21a65ed47cac87fa7cb88ec3ca1469716b6f537e", "0x5cbef5849c3b4d86f6830784fd3f879a2d2e61c7", "3200000000000000000000000");
DemoSale.at("0x32cca2bb34b36409b29166fbec9b617cda1e0410").transferTokenOwnership("0xe5898e6c69a9b1f6cdc2a9bcef58f5f4130f276b");
DemoSale.at("0xe5898e6c69a9b1f6cdc2a9bcef58f5f4130f276b").transferRole("operator", "0xc66d094ed928f7840a6b0d373c1cd825c97e3c7c");
