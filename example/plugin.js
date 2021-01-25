/**
 * This example illustrates how to communicate with a contract in a Dark Forest plugin
 * Search for the "IMPORTANT" tag. Those places in the code illustrate how to load/interact with the smart contract you deployed using this repo
 */

const K = "DF_ACHIEVEMENTS"
// IMPORTANT: You need to hardcode the address of your contract (you get it when running `yarn deploy`) and an url to the abi file
const CONTRACT_ADDRESS = "0x00754b9f2805b5Fd1E5C2D365DFe99D08a37db6D"
// You can upload the abi file wherever you want. I chose Github Gist.
const CONTRACT_ABI = "https://gist.githubusercontent.com/justinglibert/ec38fa7e11177f1c282b551086d40f98/raw/061cf31813e98de052b612bccb8bfcadbab9cf0c/ContractABI.json"

const ACHIEVEMENTS = [
{
  name: 'Conqueror I',
  description: 'Owning a level 1 planet',
  check: df => {
    const ps = df.getMyPlanets().filter(p => p.planetLevel == 1)
    return ps.length > 0
  },
  claim: async t => {
    // IMPORTANT: Claiming an achievement from the contract
    const planetId = t.BigNumber.from("0x" + df.getMyPlanets().filter(p => p.planetLevel == 1)[0].locationId)
    await t.contract.claimAchievement(0, planetId)
  }
},
{
  name: 'Conqueror II',
  description: 'Owning a level 2 planet',
  check: df => {
    const ps = df.getMyPlanets().filter(p => p.planetLevel == 2)
    return ps.length > 0
  },
  claim: async t => {
    const planetId = t.BigNumber.from("0x" + df.getMyPlanets().filter(p => p.planetLevel == 2)[0].locationId)
    await t.contract.claimAchievement(1, planetId)
  }
},
{
  name: 'Conqueror III',
  description: 'Owning a level 3 planet',
  check: df => {
    const ps = df.getMyPlanets().filter(p => p.planetLevel == 3)
    return ps.length > 0
  },
  claim: async t => {
    const planetId = t.BigNumber.from("0x" + df.getMyPlanets().filter(p => p.planetLevel == 3)[0].locationId)
    await t.contract.claimAchievement(2, planetId)
  }
}
]

class AchievementPlugin {
  getAs() {
    const i = this.ls.getItem(K)
    const out = JSON.parse(i)
    return out
  }
  setAs(as) {
    this.ls.setItem(K, JSON.stringify(as))
  }
  constructor() {
    this.ls = window.localStorage
    // Test your contract in the console
    window.ac = this.contract
    // Init the local storage if empty
    if(!this.ls.getItem(K)){
      this.ls.setItem(K,'[]')
    }
    const checkAchievement = () => {
      const achievements = []
      for(const a of ACHIEVEMENTS) {
        if(a.check(df)) {
          achievements.push({...a, owned: true, claimed: false})
        }
      }
      const oldAchievements = this.getAs()
      const diff = achievements.filter(a => !oldAchievements.map(aa => aa.name).includes(a.name))
      if(diff.length){
        console.log("NEW ACHIEVEMENTS!", diff)
        this.setAs(achievements)
      }
      return achievements
    }
    this.run = checkAchievement
    this.interval = setInterval(() => {
      if (this.container){
        this.run()
        this.clearContainer()
        this.render(this.container)
      }
    }, 2000)
  }

  /**
   * Called when plugin is launched with the "run" button.
   */
  renderAchievement(a) {
      const achievementEntry = document.createElement('div');
      this.achievementList.appendChild(achievementEntry);
      const name = document.createElement('strong')
      const br = document.createElement('br')
      name.innerText = (a.owned ? '▣ ' : '□ ') + a.name
      name.style.fontWeight = 'bold'
      const desc = document.createElement('label')
      desc.innerText = a.owned ? a.description : '?????'
      achievementEntry.appendChild(name)
      achievementEntry.appendChild(br)
      achievementEntry.appendChild(desc)
      if(!a.claimed) {
        achievementEntry.appendChild(document.createElement('br'))
        const button = document.createElement('button')
        button.innerText = "Claim this achievement NFT"
        button.addEventListener('click', async () => {
          button.innerText = "Please wait up to 15s for the achievement to appear"
          await a.claim(this)
          await new Promise((res, _) => setTimeout(res, 15000))
          this.nfts = await this.contract.getPlayerAchievements(df.getAccount())
          this.clearContainer()
          this.render(this.container)
        })
        achievementEntry.appendChild(button)
      }
  }
  clearContainer() {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.lastChild);
    }
  }
  async render(container) {
    if(!this.contract){
      // IMPORTANT: Loading the contract from the ABI and the address
      // Load all the player's NFTs on first render
      const contractABI = (
        await fetch(CONTRACT_ABI).then((x) => x.json())
      ).abi;
      this.contract = await df.loadContract(CONTRACT_ADDRESS, contractABI)
      window.ac = this.contract
      // IMPORTANT: Get achievements from contract
      this.nfts = await this.contract.getPlayerAchievements(df.getAccount())
      // Load the BigNumber from Skypack CDN
      const { BigNumber } = await import('https://cdn.skypack.dev/ethers');
      this.BigNumber = BigNumber
    }
    const achievements = this.run()
    const remainingAchievements = ACHIEVEMENTS.filter(a => !achievements.map(aa => aa.name).includes(a.name))
    this.achievementList = document.createElement('div');
    container.appendChild(this.achievementList);  
    for(const a of [...achievements,...remainingAchievements]){
        this.renderAchievement(a)
    }
    const nftsContainer = document.createElement('label');
    nftsContainer.innerText = JSON.stringify(this.nfts)
    const title = document.createElement('strong')
    title.innerText = "Your achievement NFTs:"
    container.appendChild(document.createElement('br'))
    container.appendChild(title)
    container.appendChild(document.createElement('br'))
    container.appendChild(nftsContainer)
    this.container = container
  }

  /**
   * Called when plugin modal is closed.
   */
  destroy() {
    clearInterval(this.interval)
  }
}

/**
 * And don't forget to register it!
 */
plugin.register(new AchievementPlugin());