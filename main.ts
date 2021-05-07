import { createWriteStream, readFileSync } from "fs";
import {IgApiClient} from "instagram-private-api";
import * as _ from 'underscore'
require('dotenv').config()

async function verificaUnfollows() {

    const ig = new IgApiClient()

    const user = process.env.IG_USER
    const senha = process.env.IG_SENHA

    ig.state.generateDevice(user)

    await ig.account.login(user, senha)

    const seguidoresFeed = await ig.feed.accountFollowers()

    const seguidores = await getSeguidores(seguidoresFeed)

    compararSeguidores(seguidores)

    salvarSeguidores(seguidores)

}

function compararSeguidores(seguidores) {
    const file = readFileSync("seguidores.txt", "utf-8")

    const seguidoresAntigos = file.split(",")

    let unfollows = _.difference(seguidoresAntigos, seguidores)

    console.log("Pararam de Seguir:")
    if(unfollows) {
        unfollows.forEach(unfollow => console.log(unfollow))
    }


}

function salvarSeguidores(seguidores) {
    const file = createWriteStream('seguidores.txt')

    file.write(JSON.stringify(seguidores)
        .split('"').join('')
        .replace("[", "")
        .replace("]", ""))
    file.end()
}

async function getSeguidores(seguidoresFeed) {
    let seguidores = await seguidoresFeed.items()

    while (seguidoresFeed.isMoreAvailable()) {
        seguidores = seguidores.concat(await seguidoresFeed.items())
    }

    let resultado = seguidores.map(seguidor => seguidor.username)

    return resultado
}

verificaUnfollows()