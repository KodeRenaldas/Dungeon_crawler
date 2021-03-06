import React, {useState, useEffect}from "react";
import Hero from "./components/Hero"
import Monster from "./components/Monster"
import "./css/style.css"
import MonsterData from "./data/Monsters"
import Weapons from "./data/Weapons"
import Weapon from "./components/Weapon"
import Shop from "./components/Shop"
import Fight from "./components/Fight"
import Bosses from "./data/Bosses"
import spells from "./data/spells";

export default function App() {
    // State
    const weaponArray = Weapons.data.weapons.map(weapon => {
        return <Weapon
            buyFunction = {() => buyEquipment(weapon)}
            key = {weapon.id}
            {...weapon}/>
    })
    const Spell = spells.data.spells
    const monsterArray = MonsterData.data.monsters
    const bossArray = Bosses.data.monster
    const [currentWeapon, setCurrentWeapon] = useState({
        currentWep: weaponArray[(0)].props.name,
        lowDmg: weaponArray[(0)].props.lowDmg,
        bigDmg: weaponArray[(0)].props.bigDmg,
        price: weaponArray[(0)].props.price,
        url: weaponArray[(0)].props.url
    })
    const [hero, setHero] = useState({
        health: randomNumber(150,200),
        isAlive: true,
        gold: 100,
        currentWeapon: currentWeapon.currentWep,
        potions: 3
    })
    const [monster, setMonster] = useState({
        isAlive: true,
        monsterTurn: false,
        stunned: false,
        health: monsterArray[(0)].health,
        attack: randomNumber(monsterArray[(0)].lowDmg,monsterArray[(0)].bigDmg),
        monsterImg: monsterArray[(0)].url,
        monsterWeapon: monsterArray[(0)].weapon,
        monsterName: monsterArray[(0)].name,
        weaponUrl: monsterArray[(0)].wepUrl,
    })
    const [buttonDisable, setButtonDisable] = useState(false)
    const [shop, setShop] = useState(false)
    const [defeated, setDefeated] = useState(0)
    // When to spawn boss (default 10 enemy defeats)
    const [bossSpawn, setBossSpawn] = useState(10)
    // useEffect
    useEffect(() => {
        setHero(prevHero => ({
            ...prevHero,
            attack: randomNumber(currentWeapon.lowDmg,currentWeapon.bigDmg),
            currentWeapon: currentWeapon.currentWep
        }))
    },[currentWeapon])
    useEffect(() => {
        if (hero.health<=0) {
            setHero(prevHero => ({
                ...prevHero,
                isAlive: false
            }))
        }
    },[hero.health])
    useEffect(() => {
        if (monster.health<=0) {
            setDefeated(defeated + 1)
            setMonster(prevMonster => ({
                ...prevMonster,
                isAlive: false
            }))
            setHero(prevHero => ({
                ...prevHero,
                gold: hero.gold+100
            }))
        }
        else if (monster.monsterTurn && monster.isAlive && !monster.stunned) {
            setHero(prevHero => ({
                ...prevHero,
                health: hero.health-monster.attack
            }))
            setMonster(prevMonster => ({
                ...prevMonster,
                monsterTurn: false
            }))
        }
    },[monster.health])
    // Functions
    function spawnMonster(b, r) {
        setMonster(prevMonster => ({
            ...prevMonster,
            health: b[(r)].health,
            attack: randomNumber(b[(r)].lowDmg,b[(r)].bigDmg),
            monsterImg: b[(r)].url,
            monsterWeapon: b[(r)].weapon,
            monsterName: b[(r)].name,
            weaponUrl: b[(r)].wepUrl,
            isAlive: true,
            monsterTurn: false,
            stunned: false
        }))
    }
    function changeShop() {
        shop?setShop(false):setShop(true)
    }
    function buyEquipment(i) {
        if (hero.gold >= i.price) {
            setCurrentWeapon({
                currentWep: i.name,
                lowDmg: i.lowDmg,
                bigDmg: i.bigDmg,
                price: i.price,
                url: i.url
            })
            setHero(prevHero => ({
                ...prevHero,
                gold: hero.gold-i.price
            }))
        }
    }
    function buyPotion() {
        if (hero.gold >= Weapons.data.potions[0].price) {
            setHero(prevHero => ({
                ...prevHero,
                gold: hero.gold-Weapons.data.potions[0].price,
                potions: hero.potions+1
            }))
        }
    }
    function randomNumber(min,max) {
        return Math.floor(Math.random()*(max-min+1)+min)
    }
    function drinkPotion() {
        if (hero.potions) {
            setHero(prevHero => ({
                ...prevHero,
                health: hero.health+50,
                potions: hero.potions-1
            }))
        }
    }
    function attack() {
        setButtonDisable(true)
        setTimeout(() => setButtonDisable(false), 1000)
        monster.isAlive?
        setMonster(prevMonster => ({
            ...prevMonster,
            health: monster.health-hero.attack,
            monsterTurn: true
        })) :
        (() => {
            defeated===bossSpawn?
            (() => {
                spawnMonster(bossArray, Math.floor(Math.random()*bossArray.length))
                setBossSpawn(bossSpawn+5)
            })()
            :
            (() => {
                spawnMonster(monsterArray, Math.floor(Math.random()*monsterArray.length))
            })()
        })()
    }
    return (
        <div className="main" style={{backgroundImage: shop?"url(https://i.pinimg.com/originals/50/c1/16/50c116f69d598373c72dd75b32e37389.jpg)":"url(https://rpg.nathanhare.net/media/dungeons-banner.png)"}}>
            <Hero 
            heroHealth={hero.health}
            heroAttack={hero.attack}
            currentWeaponEquiped={hero.currentWeapon}
            heroGold={hero.gold}
            heroPotions={hero.potions}
            changeShop={changeShop}
            monsterIsAlive={monster.isAlive}
            shopState={shop}
            heroIsAlive={!hero.isAlive}/>
            {shop?<Shop
            healthPotionF={buyPotion}
            shopState={shop}
            weapons={weaponArray}/>:
            <Fight
            drinkPotion={drinkPotion}
            heroButtonAttack={attack}
            btnDisable={buttonDisable}
            heroIsAlive={!hero.isAlive}
            monsterIsAlive={monster.isAlive}
            currentWeapon={currentWeapon.url}
            monsterWeaponUrl={monster.weaponUrl}
            monsterHealth={monster.health}
            stunned={monster.stunned}
            stun={()=>setMonster(prevMonster=>({...prevMonster,stunned:true}))}
            flame={()=>setMonster(prevMonster=>({...prevMonster,health: monster.health-Spell.flame.damage
            }))}
            unStun={()=>setMonster(prevMonster=>({...prevMonster,stunned:false}))}
            monsterTurn={monster.monsterTurn}
            />}
            <Monster 
            monsterHealth={monster.health}
            monsterAttack={monster.attack}
            monsterIsAlive={monster.isAlive}
            monsterImg={monster.monsterImg}
            monsterName={monster.monsterName}
            monsterWeapon={monster.monsterWeapon}
            stunned={monster.stunned}/>
        </div>
    )
}
