// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.9;

pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./DarkForestTypes.sol";
import './DarkForestCore.sol';


enum AchievementType {ConquerorI, ConquerorII, ConquerorIII}
struct Achievement {
    uint256 id;
    uint256 mintedAtTimestamp;
    AchievementType achievementType;
}


contract Contract is ERC721Upgradeable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address coreAddress = address(0);
    DarkForestCore core;
    mapping(uint256 => Achievement) achievements;
    function initialize(address payable _coreAddress) public initializer {
        coreAddress = _coreAddress;
        core = DarkForestCore(_coreAddress);
    }
    function claimAchievement(
        AchievementType achievementType,
        uint256 planetId
    ) public returns (Achievement memory) {
        //TODO: prevent players from requesting the same achievement multiple times
        uint256[] memory ids = new uint256[](1);
        ids[0] = planetId;
        DarkForestTypes.Planet[] memory planets = core.bulkGetPlanetsByIds(ids);
        DarkForestTypes.Planet memory planet = planets[0];
        require(
            planet.owner == msg.sender,
            "Not your planet"
        );
        if(achievementType == AchievementType.ConquerorI){
            require(
                planet.planetLevel == 1,
                "Planet level does not match"
            );
        }
        if(achievementType == AchievementType.ConquerorII){
            require(
                planet.planetLevel == 2,
                "Planet level does not match"
            );
        }
        if(achievementType == AchievementType.ConquerorIII){
            require(
                planet.planetLevel == 3,
                "Planet level does not match"
            );
        }
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _mint(msg.sender, tokenId);

        Achievement memory newAchievement = Achievement(
            tokenId,
            block.timestamp,
            achievementType
        );

        achievements[tokenId] = newAchievement;

        return newAchievement;
    }

    function getAchievement(uint256 tokenId)
        public
        view
        returns (Achievement memory)
    {
        return achievements[tokenId];
    }

    function getPlayerAchievements(address playerId)
        public
        view
        returns (Achievement[] memory)
    {
        uint256 balance = balanceOf(playerId);

        Achievement[] memory results = new Achievement[](balance);

        for (uint256 idx = 0; idx < balance; idx++) {
            uint256 tokenId = tokenOfOwnerByIndex(playerId, idx);
            results[idx] = achievements[tokenId];
        }

        return results;
    }
}