import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
    // timestamps: true
})
export class User {
    // 사용자 계정
    @Prop({ required : true, unique : true, index : true })
    username: string;

    // 비밀번호
    @Exclude()
    @Prop({ required : true,})
    password: string;

    // 사용자 역할
    @Prop({ required : true, default : 'USER'})
    role : string;
    
    // 이메일 주소 (선택 사항)
    // @Prop({ unique: true, sparse: true }) // unique: true (중복 방지), sparse: true (null 값은 유니크 체크 안 함)
    // email?: string; // optional 필드임을 의미

    // 계정 활성화 상태 (예: 이메일 인증 여부 등)
    // @Prop({ default: true })
    // isActive: boolean;

    // 마지막 로그인 일시
    // @Prop()
    // lastLoginAt?: Date; // Date 타입

    // MongoDB의 기본 ObjectId 외에 별도의 사용자 ID를 사용하고 싶다면 정의
    // @Prop({ type: String, unique: true, index: true })
    // userId: string; // uuid 등으로 생성하여 관리

    // --- timestamps: true 옵션 사용 시 자동 추가 ---
    // createdAt: Date; // 문서 생성 일시
    // updatedAt: Date; // 문서 마지막 업데이트 일시
}

export const UserSchema = SchemaFactory.createForClass(User);
