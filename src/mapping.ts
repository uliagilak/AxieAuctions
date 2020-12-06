import { BigInt,Address } from "@graphprotocol/graph-ts"
import {
  Contract,
  AuctionCreated,
  AuctionSuccessful,
  AuctionCancelled,
  Pause,
  Unpause,
  OwnershipTransferred
} from "../generated/Contract/Contract"
import { Auction,User,Stats } from "../generated/schema"

export function loadStat(): Stats {
  let stat = Stats.load('0');
  if (stat == null) {
    stat = new Stats('0');
    stat.activeauctions=BigInt.fromI32(0)
    stat.cancelledautctions=BigInt.fromI32(0)
    stat.finishedauctions=BigInt.fromI32(0)
    stat.save();
  }
  return stat as Stats;
}

export function loadUser(address: Address): User {
  let user = User.load(address.toHexString());
  if (user == null) {
    user = new User(address.toHexString());
    user.save();
  }
  return user as User;
}

export function loadAuction(tokenid: BigInt): Auction {
  let auct = Auction.load(tokenid.toHexString());
  if (auct == null) {
    auct = new Auction(tokenid.toHexString());
    auct.save();
  }
  return auct as Auction;
}


export function handleAuctionCreated(event: AuctionCreated): void {
  let user=loadUser(event.params._seller)
  let auction=loadAuction(event.params._tokenId)
  let stats=loadStat()
  auction.active=true
  auction.duration=event.params._duration
  auction.endingPrice=event.params._endingPrice
  auction.seller=user.id
  auction.startingPrice=event.params._startingPrice
  auction.totalPrice=BigInt.fromI32(0)
  auction.save()
  stats.activeauctions=stats.activeauctions+BigInt.fromI32(1)
  stats.save()
}

export function handleAuctionSuccessful(event: AuctionSuccessful): void {
  let user=loadUser(event.params._winner)
  let auction=loadAuction(event.params._tokenId)
  let stats=loadStat()
  auction.totalPrice=auction.totalPrice
  auction.active=false
  auction.save()
  stats.activeauctions=stats.activeauctions+BigInt.fromI32(-1)
  stats.finishedauctions=stats.finishedauctions+BigInt.fromI32(1)
  stats.save()
}

export function handleAuctionCancelled(event: AuctionCancelled): void {
  let auction=loadAuction(event.params._tokenId)
  let stats=loadStat()
  auction.active=false
  auction.save()
  stats.activeauctions=stats.activeauctions+BigInt.fromI32(-1)
  stats.cancelledautctions=stats.finishedauctions+BigInt.fromI32(1)
  stats.save()

}

export function handlePause(event: Pause): void {}

export function handleUnpause(event: Unpause): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}
